"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { failPayment, fulfillPayment } from "@/lib/payments";
import { stripeEnabled } from "@/lib/stripe";

/** Solo disponible cuando Stripe no está configurado. Simula el resultado de un pago. */
export async function demoPaymentAction(formData: FormData) {
  if (stripeEnabled) redirect("/");
  const paymentId = String(formData.get("payment") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const next = String(formData.get("next") ?? "/");
  const cancel = String(formData.get("cancel") ?? "/");
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) redirect("/");

  if (outcome === "success") {
    await fulfillPayment(paymentId, `demo_${Date.now()}`);
    redirect(`${next}${next.includes("?") ? "&" : "?"}payment=${paymentId}`);
  }
  await failPayment(paymentId);
  redirect(cancel);
}
