import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";
import { refundOrder } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  failed: "Échouée",
  refunded: "Remboursée",
};

const STATUS_COLOR: Record<string, string> = {
  paid: "text-emerald",
  refunded: "text-ember",
  failed: "text-ember",
  pending: "text-foreground-muted",
};

export default async function AdminCommandesPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, currency, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl text-foreground">Commandes</h1>

      {!orders || orders.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-foreground-muted">
          Aucune commande pour l&apos;instant.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-foreground-muted">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">
                    {/* supabase-js infers embedded to-one relations as
                        arrays without generated Database types — this is
                        a single object at runtime (verified against the
                        live API). */}
                    {(
                      order.profiles as unknown as {
                        full_name: string | null;
                      } | null
                    )?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {new Date(order.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {formatXOF(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_COLOR[order.status]}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {order.status === "paid" && (
                      <form action={refundOrder.bind(null, order.id)}>
                        <Button type="submit" variant="ghost" size="sm">
                          Rembourser
                        </Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
