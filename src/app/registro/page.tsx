import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const session = await getSession();
  if (session) redirect(next && next.startsWith("/") ? next : "/cuenta");
  return (
    <AuthShell title="Crea tu cuenta" subtitle="Es gratis. Con tu cuenta podrás hacerte socio, inscribirte en eventos y comprar en la tienda.">
      <RegisterForm next={next} />
    </AuthShell>
  );
}
