"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./cart-context";
import { formatPrice } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";

export function CartDrawer() {
  const { items, open, setOpen, update, remove, totalCents, count } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            role="dialog"
            aria-label="Carrito de compra"
          >
            <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold uppercase">
                <ShoppingBag className="size-5 text-brand-600" /> Tu carrito
                <span className="rounded-full bg-ink-100 px-2 py-0.5 font-sans text-xs font-semibold text-ink-700">{count}</span>
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-ink-100" aria-label="Cerrar carrito">
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-ink-500">
                  <ShoppingBag className="size-12 text-ink-300" />
                  <p>Tu carrito está vacío.</p>
                  <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                    Seguir comprando
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {items.map((item) => (
                    <li key={item.variantId} className="flex gap-4 py-4">
                      <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <Link href={`/tienda/${item.slug}`} onClick={() => setOpen(false)} className="font-semibold leading-tight hover:text-brand-600">
                          {item.name}
                        </Link>
                        <span className="text-sm text-ink-500">{item.variantLabel}</span>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="inline-flex items-center rounded-full border border-ink-200">
                            <button onClick={() => update(item.variantId, item.quantity - 1)} className="p-2 hover:text-brand-600" aria-label="Restar">
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => update(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              className="p-2 hover:text-brand-600 disabled:opacity-40"
                              aria-label="Sumar"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <span className="font-display text-lg font-bold">{formatPrice(item.unitPriceCents * item.quantity)}</span>
                        </div>
                      </div>
                      <button onClick={() => remove(item.variantId)} className="self-start p-1 text-ink-400 hover:text-brand-600" aria-label="Eliminar">
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-ink-100 px-5 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-ink-600">Subtotal</span>
                  <span className="font-display text-2xl font-extrabold">{formatPrice(totalCents)}</span>
                </div>
                <div onClick={() => setOpen(false)}>
                  <ButtonLink href="/checkout" className="w-full">
                    Tramitar pedido
                  </ButtonLink>
                </div>
                <p className="mt-3 text-center text-xs text-ink-500">Envío y recogida en el club disponibles. Pago seguro.</p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
