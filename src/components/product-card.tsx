import Image from "next/image";
import Link from "next/link";

import { formatEUR, formatXOF } from "@/lib/currency";

export interface ProductCardData {
  slug: string;
  title: string;
  category: string | null;
  priceXof: number;
  priceEur: number;
  coverImage: string | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-gold"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0d1b2e]">
        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-serif text-2xl text-gold">W</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category && (
          <span className="text-xs uppercase tracking-wide text-foreground-muted">
            {product.category}
          </span>
        )}
        <h3 className="font-serif text-lg text-foreground group-hover:text-gold-strong">
          {product.title}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-medium text-foreground">
            {formatXOF(product.priceXof)}
          </span>
          <span className="text-sm text-foreground-muted">
            / {formatEUR(product.priceEur)}
          </span>
        </div>
      </div>
    </Link>
  );
}
