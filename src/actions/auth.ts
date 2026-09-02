"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { loginSchema, registerSchema, type FormState } from "@/lib/validators";

function safeNext(value: FormDataEntryValue | null, fallback: string) {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    isFirefighter: formData.get("isFirefighter") === "on",
    acceptTerms: formData.get("acceptTerms") === "on",
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const { name, email, phone, password, isFirefighter } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { errors: { email: ["Ya existe una cuenta con este correo. ¿Quieres iniciar sesión?"] } };

  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, isFirefighter, passwordHash: await hashPassword(password), role: "PARTICIPANTE" },
  });
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  redirect(safeNext(formData.get("next"), "/cuenta"));
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { message: "Correo o contraseña incorrectos." };
  }
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  redirect(safeNext(formData.get("next"), user.role === "ADMIN" ? "/admin" : "/cuenta"));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
