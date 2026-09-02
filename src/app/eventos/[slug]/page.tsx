import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users, Ticket, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Container } from "@/components/ui/container";
import { Markdown } from "@/components/ui/markdown";
import { Reveal } from "@/components/ui/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Field, textareaClass } from "@/components/ui/form";
import { getActiveMembership, getEvent } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { registerForEventAction } from "@/actions/events";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvent(slug);
  return e ? { title: e.title, description: e.description.slice(0, 160) } : {};
}

export default async function EventPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const [event, user] = await Promise.all([getEvent(slug), getCurrentUser()]);
  if (!event || !event.published) notFound();

  const [membership, registration] = await Promise.all([
    user ? getActiveMembership(user.id) : null,
    user ? prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: event.id, userId: user.id } } }) : null,
  ]);

  const confirmed = event._count.registrations;
  const isFull = event.capacity != null && confirmed >= event.capacity;
  const isClosed = (event.registrationDeadline && event.registrationDeadline < new Date()) || event.startsAt < new Date();
  const price = membership && event.memberPriceCents != null ? event.memberPriceCents : event.priceCents;
  const alreadyIn = registration?.status === "CONFIRMED";

  return (
    <>
      <PageHero eyebrow={event.section ? `Sección de ${event.section.name}` : "Evento del club"} title={event.title} image={event.coverImage ?? undefined} />

      <Container className="grid gap-12 py-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <ul className="mb-8 grid gap-3 sm:grid-cols-3">
            <InfoTile icon={<CalendarDays className="size-5" />} label="Fecha" value={formatDate(event.startsAt, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })} />
            <InfoTile icon={<MapPin className="size-5" />} label="Lugar" value={event.location} />
            <InfoTile icon={<Users className="size-5" />} label="Plazas" value={event.capacity ? `${confirmed} / ${event.capacity}` : `${confirmed} inscritos`} />
          </ul>
          <Markdown content={event.description} className="text-lg" />
          {event.registrationDeadline && (
            <p className="mt-6 text-sm text-ink-500">Plazo de inscripción hasta el {formatDate(event.registrationDeadline, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}.</p>
          )}
        </Reveal>

        <aside className="lg:col-span-5">
          <Reveal className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-2xl font-bold uppercase"><Ticket className="size-5 text-brand-600" /> Inscripción</h2>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-5xl font-extrabold">{price === 0 ? "Gratis" : formatPrice(price)}</span>
              {membership && event.memberPriceCents != null && event.memberPriceCents < event.priceCents && (
                <span className="text-sm text-ink-400 line-through">{formatPrice(event.priceCents)}</span>
              )}
            </div>
            {!membership && event.memberPriceCents != null && event.memberPriceCents < event.priceCents && (
              <p className="mt-1 text-sm text-brand-600">
                Los socios pagan {event.memberPriceCents === 0 ? "0 €" : formatPrice(event.memberPriceCents)}. <Link href="/socios" className="underline">Hazte socio</Link>
              </p>
            )}

            <div className="mt-6 space-y-3">
              {sp.pago === "ok" && <Alert tone="success"><CheckCircle2 className="mr-1 inline size-4" /> ¡Inscripción confirmada! Te esperamos.</Alert>}
              {sp.cancelado && <Alert tone="error">El pago se ha cancelado. Puedes volver a intentarlo.</Alert>}
              {sp.error === "completo" && <Alert tone="error">El evento está completo.</Alert>}
              {sp.error === "cerrado" && <Alert tone="error">El plazo de inscripción ha finalizado.</Alert>}

              {alreadyIn ? (
                <Alert tone="success"><CheckCircle2 className="mr-1 inline size-4" /> Ya estás inscrito en este evento. Consulta tus inscripciones en <Link href="/cuenta" className="underline">tu cuenta</Link>.</Alert>
              ) : isClosed ? (
                <Alert><AlertCircle className="mr-1 inline size-4" /> Las inscripciones están cerradas.</Alert>
              ) : isFull ? (
                <Alert><AlertCircle className="mr-1 inline size-4" /> No quedan plazas disponibles.</Alert>
              ) : !user ? (
                <>
                  <p className="text-sm text-ink-600">Para inscribirte necesitas una cuenta. Es gratis y solo tardas un minuto.</p>
                  <ButtonLink href={`/login?next=/eventos/${event.slug}`} className="w-full">Acceder para inscribirme</ButtonLink>
                  <ButtonLink href={`/registro?next=/eventos/${event.slug}`} variant="outline" className="w-full">Crear cuenta</ButtonLink>
                </>
              ) : (
                <form action={registerForEventAction} className="space-y-4">
                  <input type="hidden" name="slug" value={event.slug} />
                  <Field label="Observaciones (talla de camiseta, alergias, equipo…)" name="notes">
                    <textarea id="notes" name="notes" className={textareaClass} maxLength={500} />
                  </Field>
                  <Button type="submit" className="w-full">
                    {price === 0 ? "Confirmar inscripción" : `Inscribirme y pagar ${formatPrice(price)}`}
                  </Button>
                  <p className="text-center text-xs text-ink-500">Pago seguro. Al inscribirte aceptas los <Link href="/legal/terminos" className="underline">términos y condiciones</Link>.</p>
                </form>
              )}
            </div>
          </Reveal>
        </aside>
      </Container>
    </>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="rounded-xl border border-ink-100 bg-ink-50 p-4">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">{icon} {label}</span>
      <span className="mt-1 block font-semibold capitalize text-ink-900">{value}</span>
    </li>
  );
}
