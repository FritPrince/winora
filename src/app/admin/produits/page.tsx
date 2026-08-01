import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatXOF } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

export default async function AdminProduitsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, title, status, price_xof, category")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">Produits</h1>
        <Link href="/admin/produits/nouveau">
          <Button>Nouveau produit</Button>
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-foreground-muted">
          Aucun produit pour l&apos;instant.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-foreground-muted">
              <tr>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">
                    {product.title}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {product.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {formatXOF(product.price_xof)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.status === "published"
                          ? "text-emerald"
                          : "text-foreground-muted"
                      }
                    >
                      {STATUS_LABEL[product.status] ?? product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/produits/${product.id}`}
                      className="text-gold-strong hover:underline"
                    >
                      Modifier
                    </Link>
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
