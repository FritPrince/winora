import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase/server";

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const { data: allProducts } = await supabase
    .from("products")
    .select("slug, title, category, price_xof, price_eur, cover_image")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const products = allProducts ?? [];
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  ) as string[];

  const visibleProducts = category
    ? products.filter((p) => p.category === category)
    : products;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-strong">
          Catalogue
        </p>
        <h1 className="mt-3 font-serif text-3xl text-foreground">
          Nos produits
        </h1>
      </div>

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 text-sm">
          <Link
            href="/produits"
            className={`rounded-full border px-4 py-1.5 ${
              !category
                ? "border-gold bg-gold/10 text-gold-strong"
                : "border-border text-foreground-muted hover:text-foreground"
            }`}
          >
            Tout
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/produits?category=${encodeURIComponent(c)}`}
              className={`rounded-full border px-4 py-1.5 ${
                category === c
                  ? "border-gold bg-gold/10 text-gold-strong"
                  : "border-border text-foreground-muted hover:text-foreground"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {visibleProducts.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-foreground-muted">
          Le catalogue arrive bientôt.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.slug}
              product={{
                slug: product.slug,
                title: product.title,
                category: product.category,
                priceXof: product.price_xof,
                priceEur: product.price_eur,
                coverImage: product.cover_image,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
