"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { consumirIntento, ipDelCliente, limpiarIntentos, minutosRestantes } from "@/lib/rate-limit";
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

  // Evita el alta masiva de cuentas desde una misma dirección
  const ip = await ipDelCliente();
  const limite = await consumirIntento(`registro:ip:${ip}`, 5, 60, 30);
  if (!limite.permitido) {
    return { message: `Demasiadas cuentas creadas desde aquí. Inténtalo de nuevo dentro de ${minutosRestantes(limite.bloqueadoHasta!)} minutos.` };
  }

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

  // Dos contadores: uno por cuenta (evita ataques dirigidos) y otro por red
  const email = parsed.data.email;
  const ip = await ipDelCliente();
  const porCorreo = await consumirIntento(`login:email:${email}`, 5, 15, 15);
  const porIp = await consumirIntento(`login:ip:${ip}`, 20, 15, 15);
  if (!porCorreo.permitido || !porIp.permitido) {
    const hasta = porCorreo.bloqueadoHasta ?? porIp.bloqueadoHasta!;
    return {
      message: `Demasiados intentos fallidos. Vuelve a probar dentro de ${minutosRestantes(hasta)} minutos o restablece tu contraseña.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    const quedan = Math.min(porCorreo.restantes, porIp.restantes);
    return {
      message: `Correo o contraseña incorrectos.${quedan <= 2 ? ` Te quedan ${quedan} intentos antes de que la cuenta se bloquee temporalmente.` : ""}`,
    };
  }

  // Acceso correcto: se limpian los contadores
  await Promise.all([limpiarIntentos(`login:email:${email}`), limpiarIntentos(`login:ip:${ip}`)]);
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  redirect(safeNext(formData.get("next"), user.role === "ADMIN" ? "/admin" : "/cuenta"));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
