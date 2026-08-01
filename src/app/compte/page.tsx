import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../(auth)/actions";

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: purchases } = await supabase
    .from("order_items")
    .select("id, product_id, products(title), orders!inner(user_id, status, created_at)")
    .eq("orders.user_id", user.id)
    .eq("orders.status", "paid")
    .order("id", { ascending: false });

  return (
    <main className="mx-auto max-w-lg px-6 py-24">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">
          Mon compte
        </p>
        <h1 className="mt-3 font-serif text-2xl text-foreground">
          {user.email}
        </h1>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          Mes achats
        </h2>
        {!purchases || purchases.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface px-4 py-6 text-center text-sm text-foreground-muted">
            Aucun achat pour l&apos;instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {purchases.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="text-sm text-foreground">
                  {/* Same to-one embed typed as an array without
                      generated Database types — single object at
                      runtime. */}
                  {(item.products as unknown as { title: string } | null)
                    ?.title ?? "Produit"}
                </span>
                <a
                  href={`/api/telechargement/${item.id}`}
                  className="text-sm font-medium text-gold-strong hover:underline"
                >
                  Télécharger
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 text-center">
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Se déconnecter
          </Button>
        </form>
      </div>
    </main>
  );
}
