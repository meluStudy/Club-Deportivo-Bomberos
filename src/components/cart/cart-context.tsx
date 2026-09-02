"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string;
  unitPriceCents: number;
  image?: string;
  quantity: number;
  maxStock: number;
};

// ── Almacén externo persistido en localStorage ──
const KEY = "cdb-cart-v1";
const EMPTY: CartItem[] = [];
let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as CartItem[]) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: CartItem[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  update: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  count: number;
  totalCents: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const [open, setOpen] = useState(false);

  const add = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    const prev = read();
    const existing = prev.find((i) => i.variantId === item.variantId);
    write(
      existing
        ? prev.map((i) => (i.variantId === item.variantId ? { ...i, quantity: Math.min(i.maxStock, i.quantity + quantity) } : i))
        : [...prev, { ...item, quantity: Math.min(item.maxStock, quantity) }],
    );
    setOpen(true);
  }, []);

  const update = useCallback((variantId: string, quantity: number) => {
    write(
      read()
        .map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(0, Math.min(i.maxStock, quantity)) } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const remove = useCallback((variantId: string) => write(read().filter((i) => i.variantId !== variantId)), []);
  const clear = useCallback(() => write(EMPTY), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      add,
      update,
      remove,
      clear,
      open,
      setOpen,
      count: items.reduce((n, i) => n + i.quantity, 0),
      totalCents: items.reduce((n, i) => n + i.quantity * i.unitPriceCents, 0),
    }),
    [items, add, update, remove, clear, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
