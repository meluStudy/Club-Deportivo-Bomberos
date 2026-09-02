"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getActiveMembership } from "@/lib/data";
import { startCheckout } from "@/lib/payments";
import { checkoutSchema } from "@/lib/validators";

export type CheckoutResult = { ok: true; url: string } | { ok: false; message: string; errors?: Record<string, string[]> };

export async function createOrderAction(input: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa los datos del formulario.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const data = parsed.data;
  if (data.shippingMethod === "envio" && (!data.address || !data.city || !data.postalCode)) {
    return { ok: false, message: "Indica la dirección completa de envío.", errors: { address: ["Dirección obligatoria para envío"] } };
  }

  const user = await getCurrentUser();
  const membership = user ? await getActiveMembership(user.id) : null;

  const variants = await prisma.productVariant.findMany({ where: { id: { in: data.items.map((i) => i.variantId) } }, include: { product: true } });

  const lines: { variantId: string; productName: string; variantLabel: string; quantity: number; unitPriceCents: number }[] = [];
  for (const item of data.items) {
    const v = variants.find((x) => x.id === item.variantId);
    if (!v || !v.product.active) return { ok: false, message: "Alguno de los productos ya no está disponible." };
    if (v.stock < item.quantity) return { ok: false, message: `No hay stock suficiente de "${v.product.name} (${[v.color, v.size].filter(Boolean).join(" · ")})". Quedan ${v.stock}.` };
    const unit = membership && v.product.memberPriceCents != null ? v.product.memberPriceCents : v.product.priceCents;
    lines.push({ variantId: v.id, productName: v.product.name, variantLabel: [v.color, v.size].filter(Boolean).join(" · "), quantity: item.quantity, unitPriceCents: unit });
  }

  const shippingCents = data.shippingMethod === "envio" ? 495 : 0;
  const totalCents = lines.reduce((n, l) => n + l.quantity * l.unitPriceCents, 0) + shippingCents;

  const order = await prisma.order.create({
    data: {
      userId: user?.id ?? null,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone || null,
      totalCents,
      shippingMethod: data.shippingMethod,
      address: data.shippingMethod === "envio" ? JSON.stringify({ address: data.address, city: data.city, postalCode: data.postalCode }) : null,
      items: { create: lines },
    },
  });

  const items = lines.map((l) => ({ name: l.productName, description: l.variantLabel, amountCents: l.unitPriceCents, quantity: l.quantity }));
  if (shippingCents) items.push({ name: "Gastos de envío", description: "Península", amountCents: shippingCents, quantity: 1 });

  const url = await startCheckout({
    type: "ORDER",
    referenceId: order.id,
    userId: user?.id,
    email: data.email,
    items,
    successPath: `/tienda/pedido/${order.id}`,
    cancelPath: "/checkout?cancelado=1",
  });
  return { ok: true, url };
}
