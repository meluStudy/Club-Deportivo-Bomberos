"use client";

import { useMemo, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { cn, formatPrice } from "@/lib/utils";

type Variant = { id: string; size: string | null; color: string | null; stock: number };

export function AddToCart({
  product,
  variants,
  unitPriceCents,
  image,
}: {
  product: { id: string; slug: string; name: string };
  variants: Variant[];
  unitPriceCents: number;
  image?: string;
}) {
  const { add } = useCart();
  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[], [variants]);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const sizes = useMemo(() => variants.filter((v) => !color || v.color === color), [variants, color]);
  const [variantId, setVariantId] = useState<string | null>(sizes.find((v) => v.stock > 0)?.id ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const canAdd = selected && selected.stock > 0;

  const onColor = (c: string) => {
    setColor(c);
    const first = variants.find((v) => v.color === c && v.stock > 0) ?? variants.find((v) => v.color === c);
    setVariantId(first?.id ?? null);
  };

  const submit = () => {
    if (!selected) return;
    add(
      {
        variantId: selected.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantLabel: [selected.color, selected.size].filter(Boolean).join(" · "),
        unitPriceCents,
        image,
        maxStock: selected.stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-6">
      {colors.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-800">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button key={c} onClick={() => onColor(c)} className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition", color === c ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 hover:border-ink-950")}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-ink-800">Talla</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariantId(v.id)}
              disabled={v.stock === 0}
              className={cn(
                "min-w-12 rounded-xl border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through",
                variantId === v.id ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 hover:border-brand-600",
              )}
              aria-pressed={variantId === v.id}
            >
              {v.size ?? "Única"}
            </button>
          ))}
        </div>
        {selected && (
          <p className="mt-2 text-xs text-ink-500">
            {selected.stock === 0 ? "Sin stock" : selected.stock <= 5 ? `¡Solo quedan ${selected.stock} unidades!` : `${selected.stock} unidades disponibles`}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="h-12 rounded-xl border border-ink-200 px-3 font-semibold" aria-label="Cantidad" disabled={!canAdd}>
          {Array.from({ length: Math.min(10, selected?.stock ?? 1) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <Button onClick={submit} disabled={!canAdd} size="lg" className="flex-1">
          {added ? <><Check className="size-5" /> Añadido</> : <><ShoppingBag className="size-5" /> Añadir al carrito · {formatPrice(unitPriceCents * qty)}</>}
        </Button>
      </div>
    </div>
  );
}
