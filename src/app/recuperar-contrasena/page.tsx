import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { SolicitarResetForm } from "@/components/password-forms";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default function RecuperarPage() {
  return (
    <AuthShell
      title="¿Has olvidado tu contraseña?"
      subtitle="Escribe el correo con el que te registraste y te enviamos un enlace para crear una nueva. El enlace caduca en una hora."
    >
      <SolicitarResetForm />
    </AuthShell>
  );
}
