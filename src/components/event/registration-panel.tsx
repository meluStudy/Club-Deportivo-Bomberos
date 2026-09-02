"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Ticket } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Field, textareaClass } from "@/components/ui/form";
import { registerForEventAction } from "@/actions/events";
import { cn, formatPrice } from "@/lib/utils";
import type { TicketOption } from "@/lib/tickets";

type Props = {
  event: { slug: string; priceCents: number; memberPriceCents: number | null; capacity: number | null; registrationDeadline: Date | null; startsAt: Date; _count: { registrations: number } };
  tickets: TicketOption[];
  user: { id: string } | null;
  isMember: boolean;
  alreadyIn: boolean;
  currentTicketName?: string | null;
  messages: Record<string, string | undefined>;
  returnTo: string;
};

const priceOf = (t: TicketOption, isMember: boolean) => (isMember && t.memberPriceCents != null ? t.memberPriceCents : t.priceCents);
const label = (cents: number) => (cents === 0 ? "Gratis" : formatPrice(cents));

export function RegistrationPanel({ event, tickets, user, isMember, alreadyIn, currentTicketName, messages: sp, returnTo }: Props) {
  const available = tickets.filter((t) => !t.soldOut);
  const [ticketId, setTicketId] = useState<string>(available[0]?.id ?? "");

  const confirmed = event._count.registrations;
  const isFull = (event.capacity != null && confirmed >= event.capacity) || (tickets.length > 0 && available.length === 0);
  const isClosed = (event.registrationDeadline && event.registrationDeadline < new Date()) || event.startsAt < new Date();

  const selected = tickets.find((t) => t.id === ticketId) ?? null;
  const price = selected ? priceOf(selected, isMember) : isMember && event.memberPriceCents != null ? event.memberPriceCents : event.priceCents;
  const cheapest = tickets.length ? Math.min(...tickets.map((t) => priceOf(t, isMember))) : price;

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-2xl font-bold uppercase">
        <Ticket className="size-5 text-brand-600" /> Inscripción
      </h2>

      {tickets.length === 0 && (
        <>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-5xl font-extrabold">{label(price)}</span>
            {isMember && event.memberPriceCents != null && event.memberPriceCents < event.priceCents && (
              <span className="text-sm text-ink-400 line-through">{formatPrice(event.priceCents)}</span>
            )}
          </div>
          {!isMember && event.memberPriceCents != null && event.memberPriceCents < event.priceCents && (
            <p className="mt-1 text-sm text-brand-600">
              Los socios pagan {label(event.memberPriceCents)}. <Link href="/socios" className="underline">Hazte socio</Link>
            </p>
          )}
        </>
      )}

      {tickets.length > 0 && (
        <p className="mt-3 text-sm text-ink-600">
          {tickets.length} modalidades disponibles desde <strong className="font-display text-lg text-ink-950">{label(cheapest)}</strong>
        </p>
      )}

      {event.capacity != null && (
        <p className="mt-2 text-sm text-ink-500">
          {Math.max(0, event.capacity - confirmed)} plazas disponibles de {event.capacity}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {sp.pago === "ok" && <Alert tone="success"><CheckCircle2 className="mr-1 inline size-4" /> ¡Inscripción confirmada! Te esperamos.</Alert>}
        {sp.cancelado && <Alert tone="error">El pago se ha cancelado. Puedes volver a intentarlo.</Alert>}
        {sp.error === "completo" && <Alert tone="error">El evento está completo.</Alert>}
        {sp.error === "cerrado" && <Alert tone="error">El plazo de inscripción ha finalizado.</Alert>}
        {sp.error === "modalidad" && <Alert tone="error">Elige una modalidad para continuar.</Alert>}
        {sp.error === "modalidad-completa" && <Alert tone="error">Esa modalidad se ha completado. Elige otra.</Alert>}

        {alreadyIn ? (
          <Alert tone="success">
            <CheckCircle2 className="mr-1 inline size-4" /> Ya estás inscrito{currentTicketName ? ` en la modalidad "${currentTicketName}"` : ""}. Consulta tus inscripciones en{" "}
            <Link href="/cuenta" className="underline">tu cuenta</Link>.
          </Alert>
        ) : isClosed ? (
          <Alert><AlertCircle className="mr-1 inline size-4" /> Las inscripciones están cerradas.</Alert>
        ) : isFull ? (
          <Alert><AlertCircle className="mr-1 inline size-4" /> No quedan plazas disponibles.</Alert>
        ) : !user ? (
          <>
            <p className="text-sm text-ink-600">Para inscribirte necesitas una cuenta. Es gratis y solo tardas un minuto.</p>
            <ButtonLink href={`/login?next=${encodeURIComponent(returnTo)}`} className="w-full">Acceder para inscribirme</ButtonLink>
            <ButtonLink href={`/registro?next=${encodeURIComponent(returnTo)}`} variant="outline" className="w-full">Crear cuenta</ButtonLink>
          </>
        ) : (
          <form action={registerForEventAction} className="space-y-4">
            <input type="hidden" name="slug" value={event.slug} />
            <input type="hidden" name="returnTo" value={returnTo} />

            {tickets.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm font-semibold text-ink-800">Elige tu modalidad</legend>
                {tickets.map((t) => {
                  const p = priceOf(t, isMember);
                  const left = t.capacity != null ? Math.max(0, t.capacity - t.taken) : null;
                  return (
                    <label
                      key={t.id}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition",
                        t.soldOut && "cursor-not-allowed opacity-55",
                        ticketId === t.id ? "border-brand-600 bg-brand-50" : "border-ink-200 hover:border-ink-400",
                      )}
                    >
                      <input
                        type="radio"
                        name="ticketId"
                        value={t.id}
                        checked={ticketId === t.id}
                        disabled={t.soldOut}
                        onChange={() => setTicketId(t.id)}
                        className="mt-1 size-4 shrink-0 accent-brand-600"
                      />
                      <span className="flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-semibold text-ink-950">{t.name}</span>
                          <span className="font-display text-xl font-extrabold">{label(p)}</span>
                        </span>
                        {t.description && <span className="mt-0.5 block text-sm text-ink-600">{t.description}</span>}
                        <span className="mt-1 block text-xs text-ink-500">
                          {t.soldOut ? "Completa" : left != null ? `${left} plazas disponibles` : "Plazas disponibles"}
                          {!isMember && t.memberPriceCents != null && t.memberPriceCents < t.priceCents && ` · socios ${label(t.memberPriceCents)}`}
                          {isMember && t.memberPriceCents != null && t.memberPriceCents < t.priceCents && ` · precio de socio aplicado`}
                        </span>
                      </span>
                    </label>
                  );
                })}
                {!isMember && tickets.some((t) => t.memberPriceCents != null && t.memberPriceCents < t.priceCents) && (
                  <p className="text-sm text-brand-600">
                    <Link href="/socios" className="underline">Hazte socio</Link> y paga el precio reducido.
                  </p>
                )}
              </fieldset>
            )}

            <Field label="Observaciones (talla de maillot, alergias, club…)" name="notes">
              <textarea id="notes" name="notes" className={textareaClass} maxLength={500} />
            </Field>
            <Button type="submit" className="w-full" disabled={tickets.length > 0 && !ticketId}>
              {price === 0 ? "Confirmar inscripción" : `Inscribirme y pagar ${formatPrice(price)}`}
            </Button>
            <p className="text-center text-xs text-ink-500">
              Pago seguro. Al inscribirte aceptas los <Link href="/legal/terminos" className="underline">términos y condiciones</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
