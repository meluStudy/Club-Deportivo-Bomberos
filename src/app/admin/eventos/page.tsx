import { prisma } from "@/lib/prisma";
import { AdminHeader, Details, Table, th, td, smallBtn } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { deleteEventAction, upsertEventAction } from "@/actions/admin";
import { Field, inputClass, textareaClass } from "@/components/ui/form";

const toLocal = (d: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export default async function AdminEvents() {
  const [events, sections] = await Promise.all([
    prisma.event.findMany({ orderBy: { startsAt: "desc" }, include: { section: true, registrations: { include: { user: true }, orderBy: { createdAt: "asc" } } } }),
    prisma.section.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <AdminHeader title="Eventos" description="Crea eventos, controla plazas e inscritos." />
      <Details summary="➕ Crear evento"><EventForm sections={sections} /></Details>

      <div className="mt-8 space-y-6">
        {events.map((e) => {
          const confirmed = e.registrations.filter((r) => r.status === "CONFIRMED");
          return (
            <section key={e.id} className="rounded-2xl bg-white p-6 shadow-card">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{e.title} {!e.published && <Badge tone="neutral">Borrador</Badge>}</h2>
                  <p className="text-sm text-ink-500">{formatDateTime(e.startsAt)} · {e.location} · {e.section?.name ?? "Club"} · {formatPrice(e.priceCents)}{e.memberPriceCents != null && ` / socios ${formatPrice(e.memberPriceCents)}`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="success">{confirmed.length}{e.capacity ? ` / ${e.capacity}` : ""} inscritos</Badge>
                  <span className="text-sm text-ink-500">Recaudado: <strong>{formatPrice(confirmed.reduce((n, r) => n + r.amountCents, 0))}</strong></span>
                  <form action={deleteEventAction}><input type="hidden" name="id" value={e.id} /><button className="text-xs text-ink-500 underline hover:text-brand-600">Eliminar</button></form>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Details summary={`Inscritos (${e.registrations.length})`}>
                  <Table>
                    <thead><tr><th className={th}>Nombre</th><th className={th}>Contacto</th><th className={th}>Importe</th><th className={th}>Estado</th><th className={th}>Notas</th></tr></thead>
                    <tbody>
                      {e.registrations.map((r) => (
                        <tr key={r.id}>
                          <td className={td}>{r.user.name}</td>
                          <td className={td}>{r.user.email}<br /><span className="text-ink-500">{r.user.phone ?? ""}</span></td>
                          <td className={td}>{formatPrice(r.amountCents)}</td>
                          <td className={td}><Badge tone={r.status === "CONFIRMED" ? "success" : r.status === "PENDING" ? "warning" : "neutral"}>{r.status === "CONFIRMED" ? "Confirmada" : r.status === "PENDING" ? "Pendiente" : "Cancelada"}</Badge></td>
                          <td className={td}>{r.notes ?? "—"}</td>
                        </tr>
                      ))}
                      {e.registrations.length === 0 && <tr><td className={td} colSpan={5}><span className="text-ink-500">Sin inscripciones.</span></td></tr>}
                    </tbody>
                  </Table>
                </Details>
                <Details summary="Editar evento"><EventForm sections={sections} event={e} /></Details>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function EventForm({ sections, event }: { sections: { id: string; name: string }[]; event?: { id: string; title: string; slug: string; description: string; location: string; startsAt: Date; registrationDeadline: Date | null; priceCents: number; memberPriceCents: number | null; capacity: number | null; sectionId: string | null; coverImage: string | null; published: boolean } }) {
  return (
    <form action={upsertEventAction} className="grid gap-4 sm:grid-cols-2">
      {event && <input type="hidden" name="id" value={event.id} />}
      <Field label="Título" name="title"><input id="title" name="title" defaultValue={event?.title} required className={inputClass} /></Field>
      <Field label="Slug (URL)" name="slug"><input id="slug" name="slug" defaultValue={event?.slug} className={inputClass} /></Field>
      <Field label="Fecha y hora" name="startsAt"><input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toLocal(event?.startsAt ?? null)} required className={inputClass} /></Field>
      <Field label="Fin de inscripciones" name="deadline"><input id="deadline" name="deadline" type="datetime-local" defaultValue={toLocal(event?.registrationDeadline ?? null)} className={inputClass} /></Field>
      <Field label="Lugar" name="location"><input id="location" name="location" defaultValue={event?.location} required className={inputClass} /></Field>
      <Field label="Sección" name="sectionId">
        <select id="sectionId" name="sectionId" defaultValue={event?.sectionId ?? ""} className={inputClass}>
          <option value="">Club (general)</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Precio (€)" name="price"><input id="price" name="price" type="number" step="0.01" min={0} defaultValue={event ? event.priceCents / 100 : 0} className={inputClass} /></Field>
      <Field label="Precio socios (€, opcional)" name="memberPrice"><input id="memberPrice" name="memberPrice" type="number" step="0.01" min={0} defaultValue={event?.memberPriceCents != null ? event.memberPriceCents / 100 : ""} className={inputClass} /></Field>
      <Field label="Plazas (vacío = ilimitadas)" name="capacity"><input id="capacity" name="capacity" type="number" min={1} defaultValue={event?.capacity ?? ""} className={inputClass} /></Field>
      <Field label="Imagen (ruta o URL)" name="image"><input id="image" name="image" defaultValue={event?.coverImage ?? ""} className={inputClass} /></Field>
      <Field label="Descripción (markdown sencillo)" name="description" className="sm:col-span-2"><textarea id="description" name="description" defaultValue={event?.description} className={textareaClass} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={event?.published ?? true} className="size-4 accent-brand-600" /> Publicado</label>
      <div className="sm:col-span-2"><button className={smallBtn}>{event ? "Guardar cambios" : "Crear evento"}</button></div>
    </form>
  );
}
