"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Package, Truck } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Field, inputClass } from "@/components/ui/form";
import { createOrderAction } from "@/actions/shop";
import { cn, formatPrice } from "@/lib/utils";

export function CheckoutForm({ user, isMember }: { user: { name: string; email: string; phone: string | null } | null; isMember: boolean }) {
  const { items, totalCents } = useCart();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [shipping, setShipping] = useState<"recogida" | "envio">("recogida");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const shippingCents = shipping === "envio" ? 495 : 0;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="mb-6 text-ink-500">Tu carrito está vacío.</p>
        <ButtonLink href="/tienda">Ir a la tienda</ButtonLink>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    setErrors({});
    start(async () => {
      const res = await createOrderAction({
        fullName: fd.get("fullName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        shippingMethod: shipping,
        address: fd.get("address"),
        city: fd.get("city"),
        postalCode: fd.get("postalCode"),
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      });
      if (res.ok) router.push(res.url);
      else {
        setError(res.message);
        setErrors(res.errors ?? {});
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-7">
        <section className="rounded-2xl border border-ink-100 p-6">
          <h2 className="mb-5 text-2xl font-bold uppercase">Tus datos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre y apellidos" name="fullName" error={errors.fullName} className="sm:col-span-2">
              <input id="fullName" name="fullName" defaultValue={user?.name} required className={inputClass} />
            </Field>
            <Field label="Correo electrónico" name="email" error={errors.email}>
              <input id="email" name="email" type="email" defaultValue={user?.email} required className={inputClass} />
            </Field>
            <Field label="Teléfono" name="phone" error={errors.phone}>
              <input id="phone" name="phone" type="tel" defaultValue={user?.phone ?? ""} className={inputClass} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 p-6">
          <h2 className="mb-5 text-2xl font-bold uppercase">Entrega</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ShipOption active={shipping === "recogida"} onClick={() => setShipping("recogida")} icon={<Package className="size-5" />} title="Recogida en el club" desc="Gratis · Parque Central de Bomberos" />
            <ShipOption active={shipping === "envio"} onClick={() => setShipping("envio")} icon={<Truck className="size-5" />} title="Envío a domicilio" desc="4,95 € · Península, 2-4 días" />
          </div>
          {shipping === "envio" && (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field label="Dirección" name="address" error={errors.address} className="sm:col-span-3">
                <input id="address" name="address" className={inputClass} required />
              </Field>
              <Field label="Código postal" name="postalCode">
                <input id="postalCode" name="postalCode" className={inputClass} required />
              </Field>
              <Field label="Ciudad" name="city" className="sm:col-span-2">
                <input id="city" name="city" className={inputClass} required />
              </Field>
            </div>
          )}
        </section>
      </div>

      <aside className="lg:col-span-5">
        <div className="sticky top-24 rounded-2xl bg-ink-950 p-6 text-white">
          <h2 className="mb-4 text-2xl font-bold uppercase">Resumen</h2>
          <ul className="divide-y divide-white/10">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-3 py-3 text-sm">
                <span>
                  {i.name} <span className="text-ink-400">· {i.variantLabel} × {i.quantity}</span>
                </span>
                <span className="font-semibold">{formatPrice(i.unitPriceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-300">Subtotal</dt><dd>{formatPrice(totalCents)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-300">Envío</dt><dd>{shippingCents ? formatPrice(shippingCents) : "Gratis"}</dd></div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-lg"><dt className="font-bold">Total</dt><dd className="font-display text-3xl font-extrabold">{formatPrice(totalCents + shippingCents)}</dd></div>
          </dl>
          {isMember && <p className="mt-3 text-xs text-brand-400">Precios de socio aplicados. El importe final se verifica en el servidor.</p>}
          {!isMember && <p className="mt-3 text-xs text-ink-400">Los precios de socio se aplican automáticamente si accedes con una cuenta de socio activa.</p>}
          {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
          <Button type="submit" loading={pending} size="lg" className="mt-6 w-full">
            <Lock className="size-4" /> Pagar de forma segura
          </Button>
          <p className="mt-3 text-center text-xs text-ink-400">
            Al pagar aceptas los <Link href="/legal/terminos" className="underline">términos</Link> y la <Link href="/legal/devoluciones" className="underline">política de devoluciones</Link>.
          </p>
        </div>
      </aside>
    </form>
  );
}

function ShipOption({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex items-start gap-3 rounded-xl border-2 p-4 text-left transition", active ? "border-brand-600 bg-brand-50" : "border-ink-200 hover:border-ink-400")} aria-pressed={active}>
      <span className={cn("mt-0.5", active ? "text-brand-600" : "text-ink-500")}>{icon}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="text-sm text-ink-600">{desc}</span>
      </span>
    </button>
  );
}
