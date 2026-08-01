"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { formatEUR, formatXOF } from "@/lib/currency";

export default function PanierPage() {
  const { items, setQuantity, removeItem, totalXof, totalEur } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-serif text-2xl text-foreground">
          Ton panier est vide
        </h1>
        <p className="mt-2 text-foreground-muted">
          Parcours le catalogue pour trouver ton prochain produit.
        </p>
        <Link href="/produits" className="mt-6 inline-block">
          <Button>Voir le catalogue</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-8 font-serif text-2xl text-foreground">Mon panier</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
          >
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg bg-[#0d1b2e]">
              {item.coverImage ? (
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-serif text-gold">W</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <Link
                href={`/produits/${item.slug}`}
                className="font-medium text-foreground hover:text-gold-strong"
              >
                {item.title}
              </Link>
              <p className="text-sm text-foreground-muted">
                {formatXOF(item.priceXof)} / {formatEUR(item.priceEur)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
              >
                −
              </Button>
              <span className="w-6 text-center">{item.quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
              >
                +
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.productId)}
            >
              Retirer
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <span className="text-foreground-muted">Total</span>
        <span className="text-xl font-medium text-foreground">
          {formatXOF(totalXof)}{" "}
          <span className="text-sm text-foreground-muted">
            / {formatEUR(totalEur)}
          </span>
        </span>
      </div>

      <Button size="lg" className="mt-6 w-full" disabled>
        Paiement bientôt disponible
      </Button>
    </main>
  );
}
