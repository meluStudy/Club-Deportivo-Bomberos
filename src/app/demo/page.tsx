import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CreditCard, KeyRound, ListChecks } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Alert } from "@/components/ui/form";
import { cuentasDemo, modoDemo, recorridoDemo } from "@/lib/demo";

export const metadata: Metadata = { title: "Cuentas de prueba", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function DemoPage() {
  if (!modoDemo()) notFound();

  return (
    <>
      <PageHero
        eyebrow="Demostración"
        title="Cuentas de prueba"
        description="Esta copia de la web sirve para enseñarla y probarla. Nada de lo que hagas aquí tiene efectos reales: no se cobra dinero ni se envían correos."
      />

      <Container className="py-14">
        <Reveal className="mb-10">
          <Alert>
            <CreditCard className="mr-1 inline size-4" /> <strong>Los pagos son simulados.</strong> Al pulsar cualquier botón de pago se abre
            una pantalla que pregunta si quieres simular que el pago sale bien o que se cancela. No hace falta tarjeta y no se cobra nada.
          </Alert>
        </Reveal>

        <Reveal>
          <h2 className="mb-2 flex items-center gap-2 text-3xl font-extrabold uppercase">
            <KeyRound className="size-6 text-brand-600" /> Con qué cuentas entrar
          </h2>
          <p className="mb-6 text-ink-600">
            Cada perfil ve cosas distintas. Entra en{" "}
            <Link href="/login" className="font-semibold text-brand-600 underline">
              acceder
            </Link>{" "}
            con cualquiera de estos correos.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {cuentasDemo.map((c, i) => (
            <Reveal key={c.email} delay={i * 0.05} className="rounded-2xl border border-ink-100 p-6 shadow-card">
              <h3 className="text-2xl font-bold uppercase">{c.rol}</h3>
              <p className="mt-1 text-sm text-ink-600">{c.descripcion}</p>
              <dl className="mt-4 space-y-1 rounded-xl bg-ink-50 p-4 font-mono text-sm">
                <div className="flex flex-wrap gap-2">
                  <dt className="text-ink-500">Correo:</dt>
                  <dd className="font-semibold break-all">{c.email}</dd>
                </div>
                <div className="flex flex-wrap gap-2">
                  <dt className="text-ink-500">Contraseña:</dt>
                  <dd className="font-semibold">{c.password}</dd>
                </div>
              </dl>
              <Link
                href={`/login?next=${encodeURIComponent(c.entrar)}`}
                className="mt-4 inline-flex items-center gap-1 font-display text-sm font-bold uppercase tracking-wide text-brand-600 hover:underline"
              >
                Entrar y empezar aquí <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <h2 className="mb-2 flex items-center gap-2 text-3xl font-extrabold uppercase">
            <ListChecks className="size-6 text-brand-600" /> Qué merece la pena probar
          </h2>
          <p className="mb-6 text-ink-600">Un recorrido de cinco minutos por lo que hace la web.</p>
        </Reveal>

        <ol className="space-y-4">
          {recorridoDemo.map((paso, i) => (
            <Reveal key={paso.titulo} delay={i * 0.05} as="li" className="flex gap-4 rounded-2xl border border-ink-100 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-lg font-extrabold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="text-xl font-bold">{paso.titulo}</h3>
                <p className="mt-1 text-ink-600">{paso.texto}</p>
                <Link href={paso.enlace} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                  Ir <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-12 rounded-2xl bg-ink-950 p-6 text-ink-300">
          <h2 className="mb-2 text-2xl font-bold uppercase text-white">Lo que verás distinto en la web real</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Los pagos se harán con tarjeta de verdad a través de Stripe.</li>
            <li>Los correos de recuperación de contraseña y los avisos de renovación llegarán al buzón.</li>
            <li>Las ilustraciones se sustituirán por fotografías del club.</li>
            <li>Los datos de ejemplo (socios, noticias, eventos) desaparecerán.</li>
          </ul>
        </Reveal>
      </Container>
    </>
  );
}
