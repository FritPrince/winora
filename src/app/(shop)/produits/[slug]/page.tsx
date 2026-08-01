import Image from "next/image";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatEUR, formatXOF } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#0d1b2e]">
          {product.cover_image ? (
            <Image
              src={product.cover_image}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-serif text-5xl text-gold">W</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.category && (
            <span className="text-xs uppercase tracking-wide text-foreground-muted">
              {product.category}
            </span>
          )}
          <h1 className="mt-2 font-serif text-3xl text-foreground">
            {product.title}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-medium text-foreground">
              {formatXOF(product.price_xof)}
            </span>
            <span className="text-foreground-muted">
              / {formatEUR(product.price_eur)}
            </span>
          </div>
          {product.description && (
            <p className="mt-6 leading-relaxed text-foreground-muted">
              {product.description}
            </p>
          )}
          <div className="mt-8">
            <AddToCartButton
              product={{
                productId: product.id,
                slug: product.slug,
                title: product.title,
                priceXof: product.price_xof,
                priceEur: product.price_eur,
                coverImage: product.cover_image,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
