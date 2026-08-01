import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatXOF } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ data: paidOrders }, { count: pendingCount }, { count: activeSubs }, { data: items }] =
    await Promise.all([
      supabase.from("orders").select("id, total").eq("status", "paid"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase.from("order_items").select("order_id, product_id"),
    ]);

  const revenue = (paidOrders ?? []).reduce((sum, o) => sum + o.total, 0);
  const paidOrderIds = new Set((paidOrders ?? []).map((o) => o.id));

  const soldCounts = new Map<string, number>();
  for (const item of items ?? []) {
    if (paidOrderIds.has(item.order_id)) {
      soldCounts.set(
        item.product_id,
        (soldCounts.get(item.product_id) ?? 0) + 1,
      );
    }
  }
  const topProductIds = [...soldCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const { data: topProducts } =
    topProductIds.length > 0
      ? await supabase
          .from("products")
          .select("id, title")
          .in(
            "id",
            topProductIds.map(([id]) => id),
          )
      : { data: [] };

  const topProductsRanked = topProductIds.map(([id, count]) => ({
    title: topProducts?.find((p) => p.id === id)?.title ?? "Produit supprimé",
    count,
  }));

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl text-foreground">
        Tableau de bord
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-foreground-muted">
            Chiffre d&apos;affaires
          </p>
          <p className="mt-2 font-serif text-2xl text-foreground">
            {formatXOF(revenue)}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-foreground-muted">
            Commandes payées
          </p>
          <p className="mt-2 font-serif text-2xl text-foreground">
            {paidOrders?.length ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-foreground-muted">
            En attente de paiement
          </p>
          <p className="mt-2 font-serif text-2xl text-foreground">
            {pendingCount ?? 0}
          </p>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Produits les plus vendus</CardTitle>
          {topProductsRanked.length === 0 ? (
            <CardDescription>
              Pas encore de vente enregistrée.
            </CardDescription>
          ) : (
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {topProductsRanked.map((p, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-foreground"
                >
                  <span>{p.title}</span>
                  <span className="text-foreground-muted">
                    {p.count} vendu{p.count > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardTitle>Abonnements actifs</CardTitle>
          <p className="mt-2 font-serif text-2xl text-foreground">
            {activeSubs ?? 0}
          </p>
          <CardDescription>
            Aucun palier d&apos;abonnement n&apos;est encore vendu — ce
            chiffre bougera une fois les plans en place.
          </CardDescription>
        </Card>
      </div>
    </div>
  );
}
