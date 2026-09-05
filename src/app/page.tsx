import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { EventCard, PostCard, ProductCard, SectionCard } from "@/components/cards";
import { getPosts, getProducts, getSections, getUpcomingEvents, getPlans, getActiveMembership } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { formatPrice, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const [posts, sections, events, products, plans, membership] = await Promise.all([
    getPosts({ take: 5 }),
    getSections(),
    getUpcomingEvents(3),
    getProducts({ featured: true, take: 4 }),
    getPlans(),
    session ? getActiveMembership(session.id) : null,
  ]);
  const [lead, ...rest] = posts;

  return (
    <>
      <Hero />
      <Marquee items={sections.map((s) => s.name)} />

      {/* Actualidad */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Actualidad"
            title="Últimas noticias"
            description="Resultados, convocatorias y la vida del club día a día."
            action={
              <ButtonLink href="/actualidad" variant="outline" size="sm">
                Ver todas <ArrowRight className="size-4" />
              </ButtonLink>
            }
          />
          {lead && (
            <div className="grid gap-6 lg:grid-cols-12">
              <Reveal className="min-w-0 lg:col-span-7">
                <PostCard post={lead} large />
              </Reveal>
              <Stagger className="min-w-0 grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                {rest.slice(0, 2).map((p) => (
                  <StaggerItem key={p.id}>
                    <PostCard post={p} />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}
        </Container>
      </section>

      {/* Secciones */}
      <section className="relative overflow-hidden bg-ink-950 py-20 text-white">
        <div className="absolute inset-0 bg-stripes" aria-hidden />
        <Container className="relative">
          <SectionHeading
            light
            eyebrow="Secciones"
            title="Un club, diez deportes"
            description="Desde el atletismo hasta el rugby: elige tu sección y entrena con tus compañeros."
            action={
              <ButtonLink href="/secciones" variant="outline-light" size="sm">
                Todas las secciones <ArrowRight className="size-4" />
              </ButtonLink>
            }
          />
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {sections.slice(0, 5).map((s) => (
              <StaggerItem key={s.id}>
                <SectionCard section={s} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Eventos */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Eventos"
            title="Próximas citas"
            description="Torneos, carreras, marchas y encuentros. Inscríbete online en un minuto."
            action={
              <ButtonLink href="/eventos" variant="outline" size="sm">
                Calendario completo <ArrowRight className="size-4" />
              </ButtonLink>
            }
          />
          <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <StaggerItem key={e.id}>
                <EventCard event={e} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Socios */}
      <section className="relative overflow-hidden bg-brand-600 py-20 text-white">
        <div className="absolute inset-0 bg-stripes" aria-hidden />
        <div className="absolute -right-32 -bottom-32 size-[30rem] rounded-full bg-ink-950/30 blur-3xl" aria-hidden />
        <Container className="relative grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Socios</p>
            <h2 className="text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl">Hazte socio del club</h2>
            <p className="mt-5 max-w-lg text-lg text-white/85">
              Acceso a todas las secciones, seguro deportivo, descuentos en tienda y eventos, y voz en la vida del club. La cuota es anual y se
              gestiona íntegramente desde esta web.
            </p>
            <ul className="mt-6 space-y-2">
              {["Entrena en cualquiera de las 10 secciones", "Descuento en tienda oficial y eventos", "Seguro deportivo federado incluido", "Voto en la asamblea general"].map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-white text-brand-600">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink href="/socios" variant="dark" size="lg">
                {membership ? "Ver mi carné de socio" : "Hazte socio ahora"} <ArrowRight className="size-5" />
              </ButtonLink>
            </div>
          </Reveal>
          <Stagger className="grid gap-4">
            {plans.map((plan) => (
              <StaggerItem key={plan.id}>
                <Link href={`/socios#${plan.slug}`} className="flex items-center justify-between gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur transition hover:bg-white/20">
                  <div>
                    <h3 className="text-2xl font-bold uppercase">{plan.name}</h3>
                    <p className="text-sm text-white/80">{parseJson<string[]>(plan.benefits, []).slice(0, 2).join(" · ")}</p>
                  </div>
                  <span className="font-display text-3xl font-extrabold">
                    {formatPrice(plan.priceCents)}
                    <span className="text-sm font-semibold">/año</span>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Tienda */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Tienda oficial"
            title="Viste los colores del club"
            description="Equipación oficial, ropa y accesorios. Los socios disfrutan de un 15% de descuento."
            action={
              <ButtonLink href="/tienda" variant="outline" size="sm">
                Ir a la tienda <ArrowRight className="size-4" />
              </ButtonLink>
            }
          />
          <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} isMember={Boolean(membership)} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>
    </>
  );
}
