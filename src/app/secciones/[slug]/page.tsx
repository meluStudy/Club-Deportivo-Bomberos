import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, UserRound } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Markdown } from "@/components/ui/markdown";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { EventCard, PostCard } from "@/components/cards";
import { SectionIcon } from "@/components/section-icon";
import { getSection } from "@/lib/data";
import { parseJson } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSection(slug);
  return s ? { title: `Sección de ${s.name}`, description: s.tagline } : {};
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const section = await getSection(slug);
  if (!section || !section.active) notFound();
  const schedule = parseJson<{ day: string; time: string; place: string }[]>(section.schedule, []);

  return (
    <>
      <PageHero eyebrow="Sección deportiva" title={section.name} description={section.tagline} image={section.coverImage ?? undefined}>
        <ButtonLink href="/socios">Hazte socio y entrena con nosotros</ButtonLink>
        <ButtonLink href="/contacto" variant="outline-light">Contactar con la sección</ButtonLink>
      </PageHero>

      <Container className="grid gap-12 py-16 lg:grid-cols-12">
        <Reveal className="min-w-0 lg:col-span-7">
          <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
            <SectionIcon slug={section.slug} className="size-8" />
          </div>
          <Markdown content={section.description} className="text-lg" />
        </Reveal>

        <aside className="min-w-0 space-y-6 lg:col-span-5">
          <Reveal className="rounded-2xl border border-ink-100 bg-ink-50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold uppercase">
              <Clock className="size-5 text-brand-600" /> Horarios de entrenamiento
            </h2>
            <ul className="divide-y divide-ink-200">
              {schedule.map((s, i) => (
                <li key={i} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold">{s.day}</span>
                  <span className="text-ink-700">{s.time}</span>
                  <span className="flex items-center gap-1 text-sm text-ink-500"><MapPin className="size-3.5" /> {s.place}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="rounded-2xl bg-ink-950 p-6 text-white" delay={0.1}>
            <h2 className="mb-4 text-2xl font-bold uppercase">Equipo técnico</h2>
            {section.coach && (
              <p className="flex items-center gap-2"><UserRound className="size-4 text-brand-400" /> {section.coach}</p>
            )}
            {section.contactEmail && (
              <a href={`mailto:${section.contactEmail}`} className="mt-2 flex items-center gap-2 text-ink-300 hover:text-white">
                <Mail className="size-4 text-brand-400" /> {section.contactEmail}
              </a>
            )}
          </Reveal>
        </aside>
      </Container>

      {section.events.length > 0 && (
        <section className="bg-ink-50 py-16">
          <Container>
            <h2 className="mb-8 text-4xl font-extrabold uppercase">Próximos eventos de {section.name}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {section.events.map((e) => (
                <EventCard key={e.id} event={{ ...e, section: { name: section.name, slug: section.slug } }} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {section.posts.length > 0 && (
        <section className="py-16">
          <Container>
            <h2 className="mb-8 text-4xl font-extrabold uppercase">Noticias de {section.name}</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {section.posts.map((p) => (
                <PostCard key={p.id} post={{ ...p, section: { name: section.name, slug: section.slug } }} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
