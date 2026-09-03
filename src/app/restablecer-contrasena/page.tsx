import type { Metadata } from "next";
import Link from "next/link";
import { createHash } from "node:crypto";
import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/password-forms";
import { Alert } from "@/components/ui/form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function RestablecerPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const registro = token
    ? await prisma.passwordResetToken.findUnique({ where: { tokenHash: createHash("sha256").update(token).digest("hex") } })
    : null;
  const valido = Boolean(registro && !registro.usedAt && registro.expiresAt > new Date());

  return (
    <AuthShell
      title={valido ? "Crea tu contraseña nueva" : "Enlace no válido"}
      subtitle={valido ? "Elige una contraseña que no uses en otros sitios." : "Este enlace ha caducado o ya se ha utilizado."}
    >
      {valido ? (
        <ResetPasswordForm token={token!} />
      ) : (
        <div className="space-y-5">
          <Alert tone="error">Los enlaces caducan a la hora y solo se pueden usar una vez.</Alert>
          <Link
            href="/recuperar-contrasena"
            className="block rounded-full bg-brand-600 px-6 py-3 text-center font-display font-bold uppercase text-white transition hover:bg-brand-700"
          >
            Pedir un enlace nuevo
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
