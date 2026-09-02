"use server";

import { prisma } from "@/lib/prisma";
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

  const { acceptPrivacy: _a, ...data } = parsed.data;
  void _a;
  await prisma.contactMessage.create({ data });
  return { ok: true, message: "¡Gracias! Hemos recibido tu mensaje y te responderemos lo antes posible." };
}
