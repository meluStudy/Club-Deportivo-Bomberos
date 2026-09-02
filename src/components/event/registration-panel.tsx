import Link from "next/link";
import { AlertCircle, CheckCircle2, Ticket } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Field, textareaClass } from "@/components/ui/form";
import { registerForEventAction } from "@/actions/events";
import { formatPrice } from "@/lib/utils";

type Props = {
  event: { slug: string; priceCents: number; memberPriceCents: number | null; capacity: number | null; registrationDeadline: Date | null; startsAt: Date; _count: { registrations: number } };
  user: { id: string } | null;
  isMember: boolean;
  alreadyIn: boolean;
  messages: Record<string, string | undefined>;
  returnTo: string;
};

export function RegistrationPanel({ event, user, isMember, alreadyIn, messages: sp, returnTo }: Props) {
  const confirmed = event._count.registrations;
  const isFull = event.capacity != null && confirmed >= event.capacity;
  const isClosed = (event.registrationDeadline && event.registrationDeadline < new Date()) || event.startsAt < new Date();
  const price = isMember && event.memberPriceCents != null ? event.memberPriceCents : event.priceCents;

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-2xl font-bold uppercase"><Ticket className="size-5 text-brand-600" /> Inscripción</h2>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="font-display text-5xl font-extrabold">{price === 0 ? "Gratis" : formatPrice(price)}</span>
        {isMember && event.memberPriceCents != null && event.memberPriceCents < event.priceCents && <span className="text-sm text-ink-400 line-through">{formatPrice(event.priceCents)}</span>}
      </div>
      {!isMember && event.memberPriceCents != null && event.memberPriceCents < event.priceCents && (
        <p className="mt-1 text-sm text-brand-600">Los socios pagan {event.memberPriceCents === 0 ? "0 €" : formatPrice(event.memberPriceCents)}. <Link href="/socios" className="underline">Hazte socio</Link></p>
      )}
      {event.capacity != null && <p className="mt-2 text-sm text-ink-500">{Math.max(0, event.capacity - confirmed)} plazas disponibles de {event.capacity}</p>}

      <div className="mt-6 space-y-3">
        {sp.pago === "ok" && <Alert tone="success"><CheckCircle2 className="mr-1 inline size-4" /> ¡Inscripción confirmada! Te esperamos.</Alert>}
        {sp.cancelado && <Alert tone="error">El pago se ha cancelado. Puedes volver a intentarlo.</Alert>}
        {sp.error === "completo" && <Alert tone="error">El evento está completo.</Alert>}
        {sp.error === "cerrado" && <Alert tone="error">El plazo de inscripción ha finalizado.</Alert>}

        {alreadyIn ? (
          <Alert tone="success"><CheckCircle2 className="mr-1 inline size-4" /> Ya estás inscrito. Consulta tus inscripciones en <Link href="/cuenta" className="underline">tu cuenta</Link>.</Alert>
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
            <Field label="Observaciones (talla de maillot, alergias, club…)" name="notes">
              <textarea id="notes" name="notes" className={textareaClass} maxLength={500} />
            </Field>
            <Button type="submit" className="w-full">{price === 0 ? "Confirmar inscripción" : `Inscribirme y pagar ${formatPrice(price)}`}</Button>
            <p className="text-center text-xs text-ink-500">Pago seguro. Al inscribirte aceptas los <Link href="/legal/terminos" className="underline">términos y condiciones</Link>.</p>
          </form>
        )}
      </div>
    </div>
  );
}
