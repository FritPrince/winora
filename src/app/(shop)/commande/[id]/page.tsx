import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/currency";
import { verifyMonerooPayment } from "@/lib/moneroo";
import { markOrderPaid } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

export default async function CommandePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  let status = order.status;

  // The webhook is the source of truth, but it may not have arrived yet
  // when the customer lands back here — a best-effort direct check keeps
  // the page from showing "pending" for several seconds for no reason.
  if (status === "pending" && order.provider_reference) {
    try {
      const payment = await verifyMonerooPayment(order.provider_reference);
      if (payment?.status === "success") {
        await markOrderPaid(order.provider_reference);
        status = "paid";
      }
    } catch {
      // Ignore — the page just shows the last known status.
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      {status === "paid" ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
            Paiement confirmé
          </p>
          <h1 className="mt-3 font-serif text-2xl text-foreground">
            Merci pour ta commande
          </h1>
          <p className="mt-2 text-foreground-muted">
            {formatXOF(order.total)} — commande #{order.id.slice(0, 8)}
          </p>
        </>
      ) : status === "failed" ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ember">
            Paiement échoué
          </p>
          <h1 className="mt-3 font-serif text-2xl text-foreground">
            Le paiement n&apos;a pas abouti
          </h1>
          <p className="mt-2 text-foreground-muted">
            Aucun montant n&apos;a été prélevé. Tu peux réessayer depuis ton
            panier.
          </p>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">
            En attente
          </p>
          <h1 className="mt-3 font-serif text-2xl text-foreground">
            Confirmation du paiement en cours
          </h1>
          <p className="mt-2 text-foreground-muted">
            Rafraîchis cette page dans quelques instants si elle ne se met
            pas à jour automatiquement.
          </p>
        </>
      )}

      <Link href="/produits" className="mt-8 inline-block">
        <Button variant="outline">Retour au catalogue</Button>
      </Link>
    </main>
  );
}
