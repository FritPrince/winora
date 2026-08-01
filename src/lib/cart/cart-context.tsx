"use client";

import * as React from "react";

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  priceXof: number;
  priceEur: number;
  coverImage: string | null;
  quantity: number;
}

const STORAGE_KEY = "winora-cart";

// Module-level store synced to localStorage, exposed to React via
// useSyncExternalStore — the pattern React itself recommends for reading
// an external system like localStorage without a synchronous setState
// inside an effect (which causes an extra render pass on every mount).
let cart: CartItem[] = [];
let hydrated = false;
let listeners: Array<() => void> = [];

function readFromStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeToStorage(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private browsing, quota) — cart stays in memory
    // for the session instead of persisting.
  }
}

function emitChange() {
  for (const listener of listeners) listener();
}

function setCart(next: CartItem[]) {
  cart = next;
  writeToStorage(cart);
  emitChange();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  if (!hydrated) {
    cart = readFromStorage();
    hydrated = true;
  }
  return cart;
}

function getServerSnapshot() {
  return [] as CartItem[];
}

export function useCart() {
  const items = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const addItem = React.useCallback((item: Omit<CartItem, "quantity">) => {
    const existing = cart.find((i) => i.productId === item.productId);
    setCart(
      existing
        ? cart.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          )
        : [...cart, { ...item, quantity: 1 }],
    );
  }, []);

  const removeItem = React.useCallback((productId: string) => {
    setCart(cart.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = React.useCallback(
    (productId: string, quantity: number) => {
      setCart(
        quantity <= 0
          ? cart.filter((i) => i.productId !== productId)
          : cart.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            ),
      );
    },
    [],
  );

  const clear = React.useCallback(() => setCart([]), []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalXof = items.reduce((sum, i) => sum + i.priceXof * i.quantity, 0);
  const totalEur = items.reduce((sum, i) => sum + i.priceEur * i.quantity, 0);

  return { items, addItem, removeItem, setQuantity, clear, count, totalXof, totalEur };
}
