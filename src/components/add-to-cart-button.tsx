"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/lib/cart/cart-context";

export function AddToCartButton({
  product,
}: {
  product: Omit<CartItem, "quantity">;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = React.useState(false);

  return (
    <Button
      type="button"
      size="lg"
      onClick={() => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? "Ajouté au panier" : "Ajouter au panier"}
    </Button>
  );
}
