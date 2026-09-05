import type { Metadata } from "next";
import Link from "next/link";
import { Check, ShieldCheck, Trophy, Users, Percent } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/form";
import { getActiveMembership, getPlans } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { joinMembershipAction } from "@/actions/membership";
import { formatPrice, parseJson, cn, currentSeason } from "@/lib/utils";

export const metadata: Metadata = { title: "Hazte socio", description: "Únete al Club Deportivo Bomberos de Madrid. Cuotas anuales, ventajas y alta online con pago seguro." };
export const dynamic = "force-dynamic";

const perks = [
  { icon: Trophy, title: "Todas las secciones", desc: "Entrena en cualquiera de las diez secciones deportivas del club." },
  { icon: ShieldCheck, title: "Seguro deportivo", desc: "Cobertura federada en entrenamientos y competiciones." },
  { icon: Percent, title: "Descuentos", desc: "15% en tienda oficial y precio reducido en todos los eventos." },
  { icon: Users, title: "Voz y voto", desc: "Participa en la asamblea general y en la vida del club." },
];

export default async function MembersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [plans, user] = await Promise.all([getPlans(), getCurrentUser()]);
  const membership = user ? await getActiveMembership(user.id) : null;
  const season = currentSeason();

  return (
    <>
      <PageHero eyebrow="Socios" title="Hazte socio del club" description={`La cuota de socio es anual (temporada ${season}) y se gestiona íntegramente online: alta, pago y renovación.`}>
        {membership ? <ButtonLink href="/cuenta">Ver mi carné de socio</ButtonLink> : <ButtonLink href="#planes">Ver cuotas</ButtonLink>}
      </PageHero>

      <Container className="py-16">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <StaggerItem key={p.title} className="rounded-2xl border border-ink-100 p-6 shadow-card">
              <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-brand-600 text-white"><p.icon className="size-6" /></span>
              <h3 className="text-2xl font-bold uppercase">{p.title}</h3>
              <p className="mt-1 text-ink-600">{p.desc}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>

      <section id="planes" className="relative overflow-hidden bg-ink-950 py-20 text-white">
        <div className="absolute inset-0 bg-stripes" aria-hidden />
        <Container className="relative">
          <Reveal className="mb-10 text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">Cuotas {season}</p>
            <h2 className="text-5xl font-extrabold uppercase">Elige tu modalidad</h2>
          </Reveal>
          <div className="mx-auto mb-8 max-w-2xl space-y-3">
            {sp.cancelado && <Alert tone="error">El pago se ha cancelado. Puedes retomarlo cuando quieras.</Alert>}
            {sp.error === "plan" && <Alert tone="error">La modalidad seleccionada no está disponible.</Alert>}
            {membership && <Alert tone="success">Ya eres socio de la temporada {membership.season} (nº {membership.memberNumber}). Puedes renovar desde <Link href="/cuenta" className="underline">tu cuenta</Link>.</Alert>}
          </div>
          <Stagger className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => {
              const benefits = parseJson<string[]>(plan.benefits, []);
              const highlight = i === 0;
              return (
                <StaggerItem key={plan.id} className={cn("flex flex-col rounded-3xl p-8", highlight ? "bg-brand-600 shadow-glow" : "bg-white/5 ring-1 ring-white/10")}>
                  <div id={plan.slug}>
                    {highlight && <span className="mb-3 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">Más popular</span>}
                    <h3 className="text-3xl font-extrabold uppercase">{plan.name}</h3>
                    <p className={cn("mt-2 text-sm", highlight ? "text-white/85" : "text-ink-300")}>{plan.description}</p>
                    <p className="mt-6 font-display text-5xl font-extrabold">
                      {formatPrice(plan.priceCents)} <span className="text-base font-semibold">/ año</span>
                    </p>
                  </div>
                  <ul className="my-8 space-y-2.5 text-sm">
                    {benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <Check className={cn("mt-0.5 size-4 shrink-0", highlight ? "text-white" : "text-brand-400")} strokeWidth={3} /> {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    {membership ? (
                      <ButtonLink href="/cuenta" variant={highlight ? "dark" : "outline-light"} className="w-full">Ya eres socio</ButtonLink>
                    ) : user ? (
                      <form action={joinMembershipAction}>
                        <input type="hidden" name="plan" value={plan.slug} />
                        <Button type="submit" variant={highlight ? "dark" : "primary"} className="w-full">Darme de alta</Button>
                      </form>
                    ) : (
                      <ButtonLink href={`/registro?next=/socios`} variant={highlight ? "dark" : "primary"} className="w-full">Crear cuenta y darme de alta</ButtonLink>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
          <p className="mt-8 text-center text-sm text-ink-400">
            El alta se completa con pago seguro con tarjeta. Al darte de alta aceptas los <Link href="/legal/estatutos" className="underline">estatutos</Link> y la <Link href="/legal/privacidad" className="underline">política de privacidad</Link>.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <Reveal>
          <h2 className="mb-6 text-4xl font-extrabold uppercase">Preguntas frecuentes</h2>
        </Reveal>
        <dl className="grid gap-6 md:grid-cols-2">
          {[
            ["¿Quién puede ser socio?", "Cualquier miembro del Cuerpo de Bomberos del Ayuntamiento de Madrid (en activo o jubilado), sus familiares directos y cualquier persona que quiera apoyar al club como simpatizante."],
            ["¿Cuándo caduca la cuota?", `La temporada va del 1 de enero al 31 de diciembre. La cuota ${season} caduca el 31 de diciembre de ${season}; podrás renovarla desde tu cuenta.`],
            ["¿Puedo entrenar en varias secciones?", "Sí. La cuota da acceso a todas las secciones. Cada sección puede tener pequeñas cuotas adicionales por licencias federativas o material específico."],
            ["¿Cómo obtengo mi carné?", "Al completar el pago, tu carné digital aparece en tu área de socio con tu número de socio y la temporada en vigor."],
          ].map(([q, a]) => (
            <Reveal key={q} className="rounded-2xl border border-ink-100 p-6">
              <dt className="text-xl font-bold">{q}</dt>
              <dd className="mt-2 text-ink-600">{a}</dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </>
  );
}
