"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { enviarCorreo } from "@/lib/mail";
import { consumirIntento, ipDelCliente, minutosRestantes } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { resetSchema, solicitarResetSchema, type FormState } from "@/lib/validators";

const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
const VIGENCIA_MIN = 60;

export async function solicitarResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = solicitarResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const { email } = parsed.data;

  // Dos límites: por correo y por dirección de red, para que nadie use esto para inundar buzones
  const ip = await ipDelCliente();
  const porIp = await consumirIntento(`reset:ip:${ip}`, 10, 60, 30);
  const porCorreo = await consumirIntento(`reset:email:${email}`, 3, 60, 30);
  if (!porIp.permitido || !porCorreo.permitido) {
    const hasta = porIp.bloqueadoHasta ?? porCorreo.bloqueadoHasta!;
    return { message: `Demasiadas solicitudes. Vuelve a intentarlo dentro de ${minutosRestantes(hasta)} minutos.` };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    // Un solo enlace válido a la vez
    await prisma.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
    const token = randomBytes(32).toString("base64url");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + VIGENCIA_MIN * 60_000) },
    });
    const url = `${site.url}/restablecer-contrasena?token=${token}`;
    await enviarCorreo({
      to: user.email,
      subject: "Restablece tu contraseña",
      template: "reset-password",
      text: `Hola ${user.name.split(" ")[0]}:\n\nHemos recibido una solicitud para restablecer la contraseña de tu cuenta en la web del ${site.name}.\n\nEl enlace caduca en ${VIGENCIA_MIN} minutos y solo se puede usar una vez.\n\nSi no has sido tú, puedes ignorar este mensaje: tu contraseña no cambiará.`,
      action: { label: "Crear una contraseña nueva", url },
      meta: { userId: user.id },
    });
  }

  // La respuesta es la misma exista o no la cuenta, para no revelar quién está registrado
  return {
    ok: true,
    message: "Si ese correo tiene una cuenta, te hemos enviado un enlace para crear una contraseña nueva. Revisa también la carpeta de correo no deseado.",
  };
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };

  const registro = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
    include: { user: true },
  });
  if (!registro || registro.usedAt || registro.expiresAt < new Date()) {
    return { message: "Este enlace ya no es válido. Vuelve a solicitar uno nuevo." };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: registro.userId }, data: { passwordHash: await hashPassword(parsed.data.password) } }),
    prisma.passwordResetToken.update({ where: { id: registro.id }, data: { usedAt: new Date() } }),
    // Al cambiar la contraseña se levanta el bloqueo de intentos de acceso
    prisma.rateLimit.deleteMany({ where: { key: { startsWith: `login:email:${registro.user.email}` } } }),
  ]);

  await enviarCorreo({
    to: registro.user.email,
    subject: "Tu contraseña se ha cambiado",
    template: "reset-password-ok",
    text: `Hola ${registro.user.name.split(" ")[0]}:\n\nTe confirmamos que la contraseña de tu cuenta se ha cambiado correctamente.\n\nSi no has sido tú, escríbenos cuanto antes a ${site.email}.`,
    meta: { userId: registro.userId },
  });

  redirect("/login?restablecida=1");
}
