"use server";

import { prisma } from "@/lib/prisma";
import { consumirIntento, ipDelCliente, minutosRestantes } from "@/lib/rate-limit";
import { contactSchema, type FormState } from "@/lib/validators";

export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    acceptPrivacy: formData.get("acceptPrivacy") === "on",
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  // Honeypot anti-spam
  if (formData.get("website")) return { ok: true, message: "Mensaje enviado." };

  const ip = await ipDelCliente();
  const limite = await consumirIntento(`contacto:ip:${ip}`, 5, 60, 30);
  if (!limite.permitido) {
    return { message: `Has enviado demasiados mensajes seguidos. Inténtalo dentro de ${minutosRestantes(limite.bloqueadoHasta!)} minutos.` };
  }

  const { acceptPrivacy: _a, ...data } = parsed.data;
  void _a;
  await prisma.contactMessage.create({ data });
  return { ok: true, message: "¡Gracias! Hemos recibido tu mensaje y te responderemos lo antes posible." };
}
