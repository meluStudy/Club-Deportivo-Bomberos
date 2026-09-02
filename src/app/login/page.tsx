import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const session = await getSession();
  if (session) redirect(next && next.startsWith("/") ? next : session.role === "ADMIN" ? "/admin" : "/cuenta");
  return (
    <AuthShell title="Bienvenido de nuevo" subtitle="Accede a tu cuenta de socio, participante o administrador.">
      <LoginForm next={next} />
    </AuthShell>
  );
}
