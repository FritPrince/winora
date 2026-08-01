"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/lib/cart/cart-context";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg p-1.5"
            style={{ background: "#0d1b2e" }}
          >
            <Image src="/winora-mark.png" alt="Winora" width={24} height={24} />
          </div>
          <span className="font-serif text-lg text-foreground">Winora</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-foreground-muted">
          <Link href="/produits" className="hover:text-foreground">
            Catalogue
          </Link>
          <Link href="/panier" className="hover:text-foreground">
            Panier{count > 0 ? ` (${count})` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
