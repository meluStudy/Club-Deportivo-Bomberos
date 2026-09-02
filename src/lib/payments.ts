import "server-only";
import { prisma } from "./prisma";
import { getStripe, stripeEnabled } from "./stripe";
import { site } from "./site";
import type { PaymentType } from "@prisma/client";

type LineItem = { name: string; description?: string; amountCents: number; quantity: number };

/**
 * Crea un pago y devuelve la URL a la que redirigir al usuario.
 * - Con Stripe configurado: Checkout Session real.
 * - Sin Stripe (modo demo): página de confirmación simulada.
 */
export async function startCheckout(opts: {
  type: PaymentType;
  referenceId: string;
  userId?: string | null;
  email: string;
  items: LineItem[];
  successPath: string;
  cancelPath: string;
}) {
  const amountCents = opts.items.reduce((n, i) => n + i.amountCents * i.quantity, 0);

  const payment = await prisma.payment.create({
    data: { type: opts.type, referenceId: opts.referenceId, userId: opts.userId ?? null, amountCents, provider: stripeEnabled ? "stripe" : "demo" },
  });

  if (amountCents === 0) {
    await fulfillPayment(payment.id, "gratis");
    return `${opts.successPath}${opts.successPath.includes("?") ? "&" : "?"}payment=${payment.id}`;
  }

  if (!stripeEnabled) {
    return `/pago/demo?payment=${payment.id}&next=${encodeURIComponent(opts.successPath)}&cancel=${encodeURIComponent(opts.cancelPath)}`;
  }

  const stripe = getStripe()!;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: opts.email,
    line_items: opts.items.map((i) => ({
      quantity: i.quantity,
      price_data: { currency: "eur", unit_amount: i.amountCents, product_data: { name: i.name, description: i.description } },
    })),
    metadata: { paymentId: payment.id, type: opts.type, referenceId: opts.referenceId },
    success_url: `${site.url}${opts.successPath}${opts.successPath.includes("?") ? "&" : "?"}payment=${payment.id}`,
    cancel_url: `${site.url}${opts.cancelPath}`,
    locale: "es",
  });

  await prisma.payment.update({ where: { id: payment.id }, data: { providerRef: session.id } });
  return session.url!;
}

/** Marca el pago como completado y actualiza la entidad asociada. Idempotente. */
export async function fulfillPayment(paymentId: string, providerRef?: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Pago no encontrado");
  if (payment.status === "SUCCEEDED") return payment;

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: paymentId }, data: { status: "SUCCEEDED", providerRef: providerRef ?? payment.providerRef } });

    if (payment.type === "MEMBERSHIP") {
      const m = await tx.membership.update({ where: { id: payment.referenceId }, data: { status: "ACTIVE", paidAt: now } });
      // Al pagar la cuota, el usuario pasa a ser SOCIO (salvo que sea admin)
      await tx.user.updateMany({ where: { id: m.userId, role: "PARTICIPANTE" }, data: { role: "SOCIO" } });
    } else if (payment.type === "EVENT") {
      await tx.eventRegistration.update({ where: { id: payment.referenceId }, data: { status: "CONFIRMED", paidAt: now } });
    } else if (payment.type === "ORDER") {
      const order = await tx.order.update({ where: { id: payment.referenceId }, data: { status: "PAID" }, include: { items: true } });
      // Descontar stock
      for (const item of order.items) {
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
      }
    }
  });

  return prisma.payment.findUnique({ where: { id: paymentId } });
}

export async function failPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status !== "PENDING") return;
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: paymentId }, data: { status: "FAILED" } });
    if (payment.type === "ORDER") await tx.order.update({ where: { id: payment.referenceId }, data: { status: "CANCELLED" } });
    if (payment.type === "EVENT") await tx.eventRegistration.update({ where: { id: payment.referenceId }, data: { status: "CANCELLED" } });
  });
}
