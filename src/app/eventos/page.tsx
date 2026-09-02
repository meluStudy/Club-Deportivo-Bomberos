import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { EventCard } from "@/components/cards";
import { getPastEvents, getUpcomingEvents } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Eventos", description: "Calendario de eventos del Club Deportivo Bomberos Madrid: torneos, carreras, marchas y encuentros. Inscripción online." };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);
  return (
    <>
      <PageHero eyebrow="Eventos" title="Calendario del club" description="Torneos, carreras populares, marchas y celebraciones. Inscríbete online y paga de forma segura desde la web." />
      <Container className="py-16">
        <h2 className="mb-8 text-4xl font-extrabold uppercase">Próximos eventos</h2>
        {upcoming.length === 0 ? (
          <p className="text-ink-500">No hay eventos programados en este momento.</p>
        ) : (
          <Stagger className="grid gap-6 lg:grid-cols-2">
            {upcoming.map((e) => (
              <StaggerItem key={e.id}>
                <EventCard event={e} />
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {past.length > 0 && (
          <>
            <h2 className="mb-6 mt-20 text-3xl font-extrabold uppercase text-ink-500">Eventos pasados</h2>
            <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-100">
              {past.map((e) => (
                <li key={e.id}>
                  <Link href={`/${e.slug}`} className="flex flex-col gap-1 px-5 py-4 transition hover:bg-ink-50 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold">{e.title}</span>
                    <span className="text-sm text-ink-500">{formatDate(e.startsAt)} · {e.location}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </>
  );
}
