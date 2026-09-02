import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Mail, MapPin, Phone, UserRound, Users, ArrowRight, BedDouble, Euro } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Markdown } from "@/components/ui/markdown";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventTabs } from "@/components/event/event-tabs";
import { StageCard } from "@/components/event/stage-card";
import { RegistrationPanel } from "@/components/event/registration-panel";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getActiveMembership } from "@/lib/data";
import { site } from "@/lib/site";
import { formatDate, formatPrice } from "@/lib/utils";
import { EVENT_TABS, parseAccommodations, parseCustomHtml, parsePairs, parseProgram, visibleTabs, type EventTabKey } from "@/lib/event-page";

type Props = { params: Promise<{ eventSlug: string; tab?: string[] }>; searchParams: Promise<Record<string, string | undefined>> };
export const dynamic = "force-dynamic";

async function loadEvent(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: { section: true, stages: { orderBy: { order: "asc" } }, _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventSlug, tab } = await params;
  const event = await loadEvent(eventSlug);
  if (!event) return {};
  const t = EVENT_TABS.find((x) => x.path === (tab?.[0] ?? ""));
  return { title: t && t.key !== "inicio" ? `${t.label} · ${event.title}` : event.title, description: event.subtitle ?? event.description.slice(0, 160), openGraph: { images: event.heroImage ?? event.coverImage ? [event.heroImage ?? event.coverImage!] : [] } };
}

export default async function EventMicrosite({ params, searchParams }: Props) {
  const { eventSlug, tab } = await params;
  const sp = await searchParams;
  const event = await loadEvent(eventSlug);
  if (!event) notFound();
  const user = await getCurrentUser();
  const canPreview = user && (user.role === "ADMIN" || (await prisma.user.findUnique({ where: { id: user.id }, select: { managedSectionId: true } }))?.managedSectionId === event.sectionId);
  if (!event.published && !canPreview) notFound();

  const tabs = visibleTabs(event);
  const path = tab?.[0] ?? "";
  if ((tab?.length ?? 0) > 1) notFound();
  const current = tabs.find((t) => t.path === path);
  if (!current) notFound();
  const key = current.key as EventTabKey;
  const html = parseCustomHtml(event.customHtml);
  const base = `/${event.slug}`;

  const [membership, registration] = await Promise.all([
    user ? getActiveMembership(user.id) : null,
    user ? prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: event.id, userId: user.id } } }) : null,
  ]);
  const highlights = parsePairs(event.highlights);
  const stagesKm = event.stages.reduce((n, s) => n + (s.distanceKm ?? 0), 0);
  const totalEle = event.stages.reduce((n, s) => n + (s.elevationM ?? 0), 0);

  return (
    <>
      {/* Cabecera */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.heroImage ?? event.coverImage ?? "/images/hero.svg"} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/10" aria-hidden />
        <div className="absolute inset-0 bg-stripes" aria-hidden />
        <Container className={key === "inicio" ? "relative py-24 sm:py-36" : "relative py-14 sm:py-20"}>
          <Reveal>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {!event.published && <Badge tone="warning">Borrador · solo visible para el panel</Badge>}
              {event.section && <Badge>Sección de {event.section.name}</Badge>}
              <Badge tone="outline"><CalendarDays className="mr-1 inline size-3" /> {formatDate(event.startsAt, { day: "numeric", month: "long", year: "numeric" })}</Badge>
            </div>
            <h1 className={`max-w-5xl font-extrabold uppercase leading-[0.9] ${key === "inicio" ? "text-5xl sm:text-7xl lg:text-8xl" : "text-4xl sm:text-6xl"}`}>{event.title}</h1>
            {event.subtitle && <p className="mt-4 max-w-2xl text-xl text-ink-200 sm:text-2xl">{event.subtitle}</p>}
            {key === "inicio" && (
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={`${base}/inscripciones`} size="lg">Inscribirme <ArrowRight className="size-5" /></ButtonLink>
                {tabs.some((t) => t.key === "etapas") && <ButtonLink href={`${base}/etapas`} size="lg" variant="outline-light">Ver etapas</ButtonLink>}
              </div>
            )}
          </Reveal>
        </Container>
      </section>

      <EventTabs base={base} tabs={tabs} />

      <Container className="py-12 sm:py-16">
        {key === "inicio" && (
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="space-y-12 lg:col-span-8">
              {highlights.length > 0 && (
                <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {highlights.map((h) => (
                    <StaggerItem key={h.label} className="rounded-2xl border border-ink-100 bg-ink-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{h.label}</p>
                      <p className="mt-1 font-display text-2xl font-bold leading-tight">{h.value}</p>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
              <Reveal><Markdown content={event.intro ?? event.description} className="text-lg" /></Reveal>
              {event.stages.length > 0 && (
                <Reveal>
                  <h2 className="mb-4 text-3xl font-extrabold uppercase">Recorrido</h2>
                  <p className="mb-4 text-ink-600">{event.stages.length} etapas{stagesKm ? ` · ${Math.round(stagesKm)} km` : ""}{totalEle ? ` · ${totalEle} m de desnivel positivo` : ""}</p>
                  <ol className="divide-y divide-ink-100 rounded-2xl border border-ink-100">
                    {event.stages.map((s, i) => (
                      <li key={s.id}>
                        <Link href={`${base}/etapas#etapa-${i + 1}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-ink-50">
                          <span><span className="font-display text-sm font-bold uppercase text-brand-600">Etapa {i + 1}</span><br /><span className="font-semibold">{s.name}</span></span>
                          <span className="shrink-0 text-right text-sm text-ink-600">{s.distanceKm ? `${s.distanceKm} km` : ""}{s.elevationM ? ` · +${s.elevationM} m` : ""}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </Reveal>
              )}
              {html.inicio && <Reveal><div className="prose-club" dangerouslySetInnerHTML={{ __html: html.inicio }} /></Reveal>}
            </div>
            <aside className="lg:col-span-4">
              <div className="sticky top-36 space-y-4">
                <RegistrationPanel event={event} user={user} isMember={Boolean(membership)} alreadyIn={registration?.status === "CONFIRMED"} messages={sp} returnTo={base} />
                <div className="rounded-2xl bg-ink-950 p-5 text-sm text-ink-200">
                  <p className="flex items-center gap-2"><MapPin className="size-4 text-brand-500" /> {event.location}</p>
                  <p className="mt-2 flex items-center gap-2"><Users className="size-4 text-brand-500" /> {event._count.registrations} inscritos{event.capacity ? ` · ${event.capacity} plazas` : ""}</p>
                  {event.registrationDeadline && <p className="mt-2 flex items-center gap-2"><Clock className="size-4 text-brand-500" /> Inscripciones hasta el {formatDate(event.registrationDeadline)}</p>}
                </div>
              </div>
            </aside>
          </div>
        )}

        {key === "presentacion" && (
          <Reveal className="mx-auto max-w-3xl">
            <Markdown content={event.presentation ?? ""} className="text-lg" />
            {html.presentacion && <div className="prose-club mt-8" dangerouslySetInnerHTML={{ __html: html.presentacion }} />}
          </Reveal>
        )}

        {key === "alojamiento" && (
          <div className="mx-auto max-w-4xl space-y-10">
            {event.accommodation && <Reveal><Markdown content={event.accommodation} className="text-lg" /></Reveal>}
            {parseAccommodations(event.accommodations).length > 0 && (
              <Stagger className="grid gap-4 sm:grid-cols-2">
                {parseAccommodations(event.accommodations).map((a) => (
                  <StaggerItem key={a.name} className="rounded-2xl border border-ink-100 p-5 shadow-card">
                    <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white"><BedDouble className="size-5" /></span>
                    <h3 className="text-xl font-bold">{a.name}</h3>
                    {a.location && <p className="flex items-center gap-1 text-sm text-ink-500"><MapPin className="size-3.5" /> {a.location}</p>}
                    {a.price && <p className="mt-2 flex items-center gap-1 font-semibold"><Euro className="size-4 text-brand-600" /> {a.price}</p>}
                    {a.contact && <p className="text-sm text-ink-700">{/@/.test(a.contact) ? <a href={`mailto:${a.contact}`} className="underline">{a.contact}</a> : a.contact}</p>}
                    {a.notes && <p className="mt-2 text-sm text-ink-500">{a.notes}</p>}
                  </StaggerItem>
                ))}
              </Stagger>
            )}
            {html.alojamiento && <Reveal><div className="prose-club" dangerouslySetInnerHTML={{ __html: html.alojamiento }} /></Reveal>}
          </div>
        )}

        {key === "programa" && (
          <div className="mx-auto max-w-4xl space-y-10">
            {parseProgram(event.program).map((day) => (
              <Reveal key={day.title}>
                <h2 className="mb-5 flex items-center gap-3 text-3xl font-extrabold uppercase"><span className="h-1 w-8 bg-brand-600" aria-hidden /> {day.title}</h2>
                <ol className="relative space-y-4 border-l-2 border-ink-100 pl-6">
                  {day.items.map((it, i) => (
                    <li key={i} className="relative rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
                      <span className="absolute -left-[1.95rem] top-5 size-3.5 rounded-full border-2 border-white bg-brand-600" aria-hidden />
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                        <span className="font-display text-2xl font-extrabold text-brand-600">{it.time}</span>
                        <div>
                          <p className="font-semibold">{it.title}</p>
                          {it.place && <p className="flex items-center gap-1 text-sm text-ink-500"><MapPin className="size-3.5" /> {it.place}</p>}
                          {it.note && <p className="mt-1 text-sm text-ink-600">{it.note}</p>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            ))}
            {html.programa && <Reveal><div className="prose-club" dangerouslySetInnerHTML={{ __html: html.programa }} /></Reveal>}
          </div>
        )}

        {key === "etapas" && (
          <div className="space-y-10">
            {event.stages.map((s, i) => (
              <div key={s.id} id={`etapa-${i + 1}`} className="scroll-mt-36">
                <StageCard stage={s} index={i} />
              </div>
            ))}
            {html.etapas && <Reveal><div className="prose-club" dangerouslySetInnerHTML={{ __html: html.etapas }} /></Reveal>}
          </div>
        )}

        {key === "inscripciones" && (
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              {event.registrationInfo ? <Markdown content={event.registrationInfo} className="text-lg" /> : <p className="text-ink-600">Completa la inscripción desde el panel de la derecha.</p>}
              <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-ink-50 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-ink-500">Precio general</dt><dd className="font-display text-3xl font-extrabold">{event.priceCents === 0 ? "Gratis" : formatPrice(event.priceCents)}</dd></div>
                {event.memberPriceCents != null && <div className="rounded-2xl bg-brand-50 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-brand-700">Precio socios</dt><dd className="font-display text-3xl font-extrabold text-brand-700">{event.memberPriceCents === 0 ? "Gratis" : formatPrice(event.memberPriceCents)}</dd></div>}
              </dl>
              {html.inscripciones && <div className="prose-club mt-8" dangerouslySetInnerHTML={{ __html: html.inscripciones }} />}
            </Reveal>
            <aside className="lg:col-span-5">
              <div className="sticky top-36">
                <RegistrationPanel event={event} user={user} isMember={Boolean(membership)} alreadyIn={registration?.status === "CONFIRMED"} messages={sp} returnTo={`${base}/inscripciones`} />
              </div>
            </aside>
          </div>
        )}

        {key === "contacto" && (
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            <Reveal className="rounded-2xl bg-ink-950 p-6 text-white">
              <h2 className="mb-4 text-2xl font-bold uppercase">Organización</h2>
              <ul className="space-y-3 text-ink-200">
                <li className="flex items-center gap-3"><UserRound className="size-5 text-brand-500" /> {event.contactName ?? (event.section ? `Sección de ${event.section.name}` : site.name)}</li>
                <li className="flex items-center gap-3"><Mail className="size-5 text-brand-500" /> <a href={`mailto:${event.contactEmail ?? event.section?.contactEmail ?? site.email}`} className="hover:text-white">{event.contactEmail ?? event.section?.contactEmail ?? site.email}</a></li>
                <li className="flex items-center gap-3"><Phone className="size-5 text-brand-500" /> <a href={`tel:${(event.contactPhone ?? site.phone).replace(/\s/g, "")}`} className="hover:text-white">{event.contactPhone ?? site.phone}</a></li>
                <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 text-brand-500" /> {event.location}</li>
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              {event.contactInfo && <Markdown content={event.contactInfo} />}
              {html.contacto && <div className="prose-club mt-4" dangerouslySetInnerHTML={{ __html: html.contacto }} />}
              <p className="mt-6 text-sm text-ink-500">También puedes usar el <Link href="/contacto" className="underline">formulario de contacto del club</Link>.</p>
            </Reveal>
          </div>
        )}
      </Container>
    </>
  );
}
