import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExternalLink, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { canManageSection, isAdmin, requireStaff } from "@/lib/auth";
import { AdminHeader, Details, Table, th, td, smallBtn } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Alert, Field, inputClass, textareaClass } from "@/components/ui/form";
import { cn, formatPrice } from "@/lib/utils";
import { EVENT_TABS, parseCustomHtml, parseGpxStats, type EventTabKey } from "@/lib/event-page";
import { deleteEventAction, deleteStageAction, deleteTicketAction, removeStageGpxAction, updateEventBasicsAction, updateEventTabAction, upsertStageAction, upsertTicketAction } from "@/actions/event-admin";
import { getTicketBreakdown } from "@/lib/tickets";
import { Stat } from "@/components/admin/ui";

const toLocal = (d: Date | null | undefined) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
const toDay = (d: Date | null | undefined) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "");

const ADMIN_TABS = [{ key: "ficha", label: "Ficha" }, ...EVENT_TABS.map((t) => ({ key: t.key, label: t.label })), { key: "modalidades", label: "Modalidades" }, { key: "inscritos", label: "Inscritos" }];

export default async function AdminEventEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const staff = await requireStaff();
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      section: true,
      stages: { orderBy: { order: "asc" } },
      tickets: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      registrations: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!event) notFound();
  if (!canManageSection(staff, event.sectionId)) redirect("/admin/eventos?error=permiso");
  const sections = isAdmin(staff) ? await prisma.section.findMany({ orderBy: { order: "asc" } }) : [];
  const breakdown = await getTicketBreakdown(event.id);
  const tab = ADMIN_TABS.some((t) => t.key === sp.tab) ? sp.tab! : "ficha";
  const html = parseCustomHtml(event.customHtml);
  const admin = isAdmin(staff);
  const tabForm = (key: EventTabKey, children: React.ReactNode, hint?: string) => (
    <form action={updateEventTabAction} className="grid gap-4">
      <input type="hidden" name="id" value={event.id} />
      <input type="hidden" name="tab" value={key} />
      {hint && <p className="rounded-xl bg-ink-50 p-3 text-sm text-ink-600">{hint}</p>}
      {children}
      {admin && (
        <Details summary="HTML libre (avanzado, solo administradores)">
          <p className="mb-2 text-sm text-ink-600">Se muestra al final de la pestaña. Úsalo para incrustar vídeos, tablas o diseños propios. Se publica tal cual, sin filtrar.</p>
          <textarea name="customHtml" defaultValue={html[key] ?? ""} className={`${textareaClass} font-mono text-sm`} placeholder="<iframe …></iframe>" />
        </Details>
      )}
      <div><button className={smallBtn}>Guardar pestaña</button></div>
    </form>
  );

  return (
    <>
      <AdminHeader
        title={event.title}
        description={`${event.section ? `Sección de ${event.section.name}` : "Evento del club"} · ${event.published ? "publicado" : "borrador"}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/${event.slug}`} target="_blank" className={cn(smallBtn, "inline-flex items-center gap-1")}><ExternalLink className="size-3.5" /> Ver microweb /{event.slug}</Link>
            <form action={deleteEventAction}><input type="hidden" name="id" value={event.id} /><button className="h-9 rounded-lg border border-ink-300 px-3 text-xs font-bold uppercase tracking-wide text-ink-600 hover:border-brand-600 hover:text-brand-600">Eliminar evento</button></form>
          </div>
        }
      />
      {sp.ok && <div className="mb-4"><Alert tone="success">Cambios guardados. La microweb ya está actualizada.</Alert></div>}
      {sp.error === "gpx-invalido" && <div className="mb-4"><Alert tone="error">El archivo no parece un GPX válido (necesita puntos trkpt o rtept).</Alert></div>}
      {sp.error === "gpx-grande" && <div className="mb-4"><Alert tone="error">El GPX supera los 6 MB. Simplifícalo antes de subirlo.</Alert></div>}

      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-card" aria-label="Pestañas del editor">
        {ADMIN_TABS.map((t) => (
          <Link key={t.key} href={`/admin/eventos/${event.id}?tab=${t.key}`} className={cn("shrink-0 rounded-xl px-4 py-2 font-display text-sm font-bold uppercase tracking-wide transition", tab === t.key ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100")}>
            {t.label}
          </Link>
        ))}
      </nav>

      <section className="rounded-2xl bg-white p-6 shadow-card">
        {tab === "ficha" && (
          <form action={updateEventBasicsAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={event.id} />
            <Field label="Título" name="title"><input id="title" name="title" defaultValue={event.title} required className={inputClass} /></Field>
            <Field label="URL (slug)" name="slug" hint={`Se publica en /${event.slug}`}><input id="slug" name="slug" defaultValue={event.slug} className={inputClass} /></Field>
            <Field label="Lema (subtítulo de la microweb)" name="subtitle" className="sm:col-span-2"><input id="subtitle" name="subtitle" defaultValue={event.subtitle ?? ""} className={inputClass} /></Field>
            <Field label="Inicio" name="startsAt"><input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toLocal(event.startsAt)} required className={inputClass} /></Field>
            <Field label="Fin (opcional)" name="endsAt"><input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toLocal(event.endsAt)} className={inputClass} /></Field>
            <Field label="Fin de inscripciones" name="deadline"><input id="deadline" name="deadline" type="datetime-local" defaultValue={toLocal(event.registrationDeadline)} className={inputClass} /></Field>
            <Field label="Lugar" name="location"><input id="location" name="location" defaultValue={event.location} required className={inputClass} /></Field>
            {admin && (
              <Field label="Sección" name="sectionId">
                <select id="sectionId" name="sectionId" defaultValue={event.sectionId ?? ""} className={inputClass}>
                  <option value="">Club (general)</option>
                  {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
            )}
            <Field label="Precio general (€)" name="price"><input id="price" name="price" type="number" step="0.01" min={0} defaultValue={event.priceCents / 100} className={inputClass} /></Field>
            <Field label="Precio socios (€, opcional)" name="memberPrice"><input id="memberPrice" name="memberPrice" type="number" step="0.01" min={0} defaultValue={event.memberPriceCents != null ? event.memberPriceCents / 100 : ""} className={inputClass} /></Field>
            <Field label="Plazas (vacío = ilimitadas)" name="capacity"><input id="capacity" name="capacity" type="number" min={1} defaultValue={event.capacity ?? ""} className={inputClass} /></Field>
            <Field label="Imagen de tarjeta (ruta o URL)" name="image"><input id="image" name="image" defaultValue={event.coverImage ?? ""} className={inputClass} /></Field>
            <Field label="Imagen de cabecera de la microweb" name="heroImage"><input id="heroImage" name="heroImage" defaultValue={event.heroImage ?? ""} className={inputClass} placeholder="Si se deja vacío se usa la de tarjeta" /></Field>
            <Field label="Descripción corta (tarjetas y listados)" name="description" className="sm:col-span-2"><textarea id="description" name="description" defaultValue={event.description} className={textareaClass} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={event.published} className="size-4 accent-brand-600" /> Publicado (visible para todo el mundo)</label>
            <div className="sm:col-span-2"><button className={smallBtn}>Guardar ficha</button></div>
          </form>
        )}

        {tab === "inicio" && tabForm("inicio", (
          <>
            <Field label="Datos destacados (una línea por dato: Etiqueta | Valor)" name="highlights"><textarea id="highlights" name="highlights" defaultValue={event.highlights ?? ""} className={textareaClass} placeholder={"Fechas | 11 y 12 de octubre\nRecorrido | 2 etapas · 215 km"} /></Field>
            <Field label="Texto de bienvenida (markdown)" name="intro"><textarea id="intro" name="intro" defaultValue={event.intro ?? ""} className={`${textareaClass} min-h-48`} /></Field>
          </>
        ), "La portada muestra la cabecera, los datos destacados, el texto de bienvenida, el resumen de etapas y el panel de inscripción.")}

        {tab === "presentacion" && tabForm("presentacion", (
          <Field label="Presentación (markdown: ## títulos, **negrita**, listas con -)" name="presentation"><textarea id="presentation" name="presentation" defaultValue={event.presentation ?? ""} className={`${textareaClass} min-h-96`} /></Field>
        ), "Si se deja vacía, la pestaña no aparece en la microweb.")}

        {tab === "alojamiento" && tabForm("alojamiento", (
          <>
            <Field label="Texto (markdown)" name="accommodation"><textarea id="accommodation" name="accommodation" defaultValue={event.accommodation ?? ""} className={`${textareaClass} min-h-40`} /></Field>
            <Field label="Alojamientos recomendados (una línea por alojamiento: Nombre | Localidad | Precio | Contacto | Notas)" name="accommodations"><textarea id="accommodations" name="accommodations" defaultValue={event.accommodations ?? ""} className={`${textareaClass} min-h-40`} placeholder="Hotel Sierra | Cercedilla | 55 € doble | 918 000 000 | Guardabicis" /></Field>
          </>
        ), "Vacío = pestaña oculta.")}

        {tab === "programa" && tabForm("programa", (
          <Field label="Programa día a día" name="program"><textarea id="program" name="program" defaultValue={event.program ?? ""} className={`${textareaClass} min-h-96 font-mono text-sm`} placeholder={"## Sábado 11 de octubre · Etapa 1\n08:00 | Salida neutralizada | Puerta del Parque Central\n11:30 | Avituallamiento | Alto del León | Reagrupamiento 15 min"} /></Field>
        ), "Formato: una línea \"## Título del día\" abre cada día; debajo, una línea por acto: Hora | Qué | Punto de encuentro | Notas (opcional).")}

        {tab === "etapas" && (
          <div className="space-y-6">
            <p className="rounded-xl bg-ink-50 p-3 text-sm text-ink-600">Cada etapa puede llevar un archivo GPX: la web calcula distancia y desnivel, dibuja el mapa y el perfil, y ofrece la descarga. El horario usa el formato Hora | Qué | Lugar.</p>
            {event.stages.map((s, i) => {
              const stats = parseGpxStats(s.gpxStats);
              return (
                <Details key={s.id} summary={`Etapa ${i + 1} · ${s.name}${stats ? ` · GPX ${stats.distanceKm} km, +${stats.elevationGain} m` : " · sin GPX"}`}>
                  <StageForm eventId={event.id} stage={s} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.gpxData && <form action={removeStageGpxAction}><input type="hidden" name="eventId" value={event.id} /><input type="hidden" name="stageId" value={s.id} /><button className="text-xs text-ink-500 underline hover:text-brand-600">Quitar GPX ({s.gpxName})</button></form>}
                    <form action={deleteStageAction}><input type="hidden" name="eventId" value={event.id} /><input type="hidden" name="stageId" value={s.id} /><button className="text-xs text-ink-500 underline hover:text-brand-600">Eliminar etapa</button></form>
                  </div>
                </Details>
              );
            })}
            <Details summary="➕ Añadir etapa"><StageForm eventId={event.id} /></Details>
          </div>
        )}

        {tab === "inscripciones" && tabForm("inscripciones", (
          <Field label="Información de inscripción (markdown)" name="registrationInfo"><textarea id="registrationInfo" name="registrationInfo" defaultValue={event.registrationInfo ?? ""} className={`${textareaClass} min-h-64`} /></Field>
        ), `El panel de inscripción y pago se genera automáticamente con los precios de la ficha (${formatPrice(event.priceCents)}${event.memberPriceCents != null ? ` / socios ${formatPrice(event.memberPriceCents)}` : ""}).`)}

        {tab === "contacto" && tabForm("contacto", (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Persona / equipo de contacto" name="contactName"><input id="contactName" name="contactName" defaultValue={event.contactName ?? ""} className={inputClass} /></Field>
              <Field label="Correo" name="contactEmail"><input id="contactEmail" name="contactEmail" type="email" defaultValue={event.contactEmail ?? ""} className={inputClass} /></Field>
              <Field label="Teléfono" name="contactPhone"><input id="contactPhone" name="contactPhone" defaultValue={event.contactPhone ?? ""} className={inputClass} /></Field>
            </div>
            <Field label="Texto adicional (markdown)" name="contactInfo"><textarea id="contactInfo" name="contactInfo" defaultValue={event.contactInfo ?? ""} className={textareaClass} /></Field>
          </>
        ), "Si no se rellena, se muestran los datos de la sección o del club.")}

        {tab === "modalidades" && (
          <div className="space-y-6">
            <p className="rounded-xl bg-ink-50 p-3 text-sm text-ink-600">
              Cada modalidad tiene su nombre, su precio, su precio de socio y sus plazas. Si no creas ninguna, se usa el precio de la ficha del
              evento. Las modalidades con inscritos no se borran: se desactivan para conservar el histórico.
            </p>

            {breakdown.rows.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Inscritos confirmados" value={breakdown.totals.confirmed} sub={`${breakdown.totals.pending} pendientes de pago`} accent />
                <Stat label="Recaudado" value={formatPrice(breakdown.totals.revenueCents)} sub="inscripciones confirmadas" />
                <Stat label="Modalidades" value={breakdown.rows.length} sub={`${breakdown.rows.filter((r) => r.active).length} activas`} />
                <Stat label="Cancelaciones" value={breakdown.totals.cancelled} />
              </div>
            )}

            {breakdown.rows.length > 0 && (
              <Table>
                <thead>
                  <tr>
                    <th className={th}>Modalidad</th><th className={th}>Precio</th><th className={th}>Socios</th>
                    <th className={th}>Confirmados</th><th className={th}>Pendientes</th><th className={th}>Plazas</th><th className={th}>Recaudado</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.rows.map((r) => {
                    const pct = r.capacity ? Math.min(100, Math.round((r.confirmed / r.capacity) * 100)) : null;
                    return (
                      <tr key={r.id}>
                        <td className={td}>{r.name} {!r.active && <Badge tone="neutral">Inactiva</Badge>}</td>
                        <td className={td}>{formatPrice(r.priceCents)}</td>
                        <td className={td}>{r.memberPriceCents != null ? formatPrice(r.memberPriceCents) : "—"}</td>
                        <td className={td}><strong className="font-display text-lg">{r.confirmed}</strong></td>
                        <td className={td}>{r.pending}</td>
                        <td className={td}>
                          {r.capacity != null ? (
                            <span className="block w-32">
                              <span className="text-xs">{r.confirmed} / {r.capacity}</span>
                              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-ink-100">
                                <span className="block h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                              </span>
                            </span>
                          ) : "Sin límite"}
                        </td>
                        <td className={td}><strong>{formatPrice(r.revenueCents)}</strong></td>
                      </tr>
                    );
                  })}
                  {breakdown.orphan && (
                    <tr>
                      <td className={td}><span className="text-ink-500">{breakdown.orphan.name}</span></td>
                      <td className={td} colSpan={2}>—</td>
                      <td className={td}>{breakdown.orphan.confirmed}</td>
                      <td className={td}>{breakdown.orphan.pending}</td>
                      <td className={td}>—</td>
                      <td className={td}>{formatPrice(breakdown.orphan.revenueCents)}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}

            {event.tickets.map((t, i) => (
              <Details key={t.id} summary={`${i + 1}. ${t.name} · ${formatPrice(t.priceCents)}${t.capacity != null ? ` · ${t.capacity} plazas` : ""}${t.active ? "" : " · inactiva"}`}>
                <TicketForm eventId={event.id} ticket={t} />
                <div className="mt-4">
                  <form action={deleteTicketAction}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <input type="hidden" name="ticketId" value={t.id} />
                    <button className="text-xs text-ink-500 underline hover:text-brand-600">Eliminar modalidad</button>
                  </form>
                </div>
              </Details>
            ))}
            <Details summary="➕ Añadir modalidad"><TicketForm eventId={event.id} /></Details>
          </div>
        )}

        {tab === "inscritos" && (
          <>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold uppercase"><Users className="size-5 text-brand-600" /> Inscritos ({event.registrations.filter((r) => r.status === "CONFIRMED").length} confirmados)</h2>
            <Table>
              <thead><tr><th className={th}>Nombre</th><th className={th}>Contacto</th><th className={th}>Modalidad</th><th className={th}>Importe</th><th className={th}>Estado</th><th className={th}>Observaciones</th></tr></thead>
              <tbody>
                {event.registrations.map((r) => (
                  <tr key={r.id}>
                    <td className={td}>{r.user.name}</td>
                    <td className={td}>{r.user.email}<br /><span className="text-ink-500">{r.user.phone ?? ""}</span></td>
                    <td className={td}>{r.ticketName ?? "—"}</td>
                    <td className={td}>{formatPrice(r.amountCents)}</td>
                    <td className={td}><Badge tone={r.status === "CONFIRMED" ? "success" : r.status === "PENDING" ? "warning" : "neutral"}>{r.status === "CONFIRMED" ? "Confirmada" : r.status === "PENDING" ? "Pendiente" : "Cancelada"}</Badge></td>
                    <td className={td}>{r.notes ?? "—"}</td>
                  </tr>
                ))}
                {event.registrations.length === 0 && <tr><td className={td} colSpan={6}><span className="text-ink-500">Sin inscripciones todavía.</span></td></tr>}
              </tbody>
            </Table>
          </>
        )}
      </section>
    </>
  );
}

function TicketForm({ eventId, ticket }: { eventId: string; ticket?: { id: string; name: string; description: string | null; priceCents: number; memberPriceCents: number | null; capacity: number | null; order: number; active: boolean } }) {
  return (
    <form action={upsertTicketAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="eventId" value={eventId} />
      {ticket && <input type="hidden" name="ticketId" value={ticket.id} />}
      <Field label="Nombre de la modalidad" name="name" className="sm:col-span-2">
        <input name="name" defaultValue={ticket?.name} required className={inputClass} placeholder="Marcha completa (2 etapas)" />
      </Field>
      <Field label="Descripción (opcional)" name="description" className="sm:col-span-2">
        <textarea name="description" defaultValue={ticket?.description ?? ""} className={textareaClass} placeholder="Incluye maillot, avituallamientos, cena del sábado y transporte de equipaje." />
      </Field>
      <Field label="Precio general (€)" name="price"><input name="price" type="number" step="0.01" min={0} defaultValue={ticket ? ticket.priceCents / 100 : ""} required className={inputClass} /></Field>
      <Field label="Precio socios (€, opcional)" name="memberPrice"><input name="memberPrice" type="number" step="0.01" min={0} defaultValue={ticket?.memberPriceCents != null ? ticket.memberPriceCents / 100 : ""} className={inputClass} /></Field>
      <Field label="Plazas de esta modalidad (vacío = sin límite)" name="capacity"><input name="capacity" type="number" min={1} defaultValue={ticket?.capacity ?? ""} className={inputClass} /></Field>
      <Field label="Orden" name="order"><input name="order" type="number" min={0} defaultValue={ticket?.order ?? ""} className={inputClass} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={ticket?.active ?? true} className="size-4 accent-brand-600" /> Visible en la web</label>
      <div className="sm:col-span-2"><button className={smallBtn}>{ticket ? "Guardar modalidad" : "Añadir modalidad"}</button></div>
    </form>
  );
}

function StageForm({ eventId, stage }: { eventId: string; stage?: { id: string; name: string; date: Date | null; startTime: string | null; startPlace: string | null; endPlace: string | null; distanceKm: number | null; elevationM: number | null; description: string | null; schedule: string | null; order: number; gpxName: string | null } }) {
  return (
    <form action={upsertStageAction} className="grid gap-4 sm:grid-cols-2" encType="multipart/form-data">
      <input type="hidden" name="eventId" value={eventId} />
      {stage && <input type="hidden" name="stageId" value={stage.id} />}
      <Field label="Nombre de la etapa" name="name" className="sm:col-span-2"><input name="name" defaultValue={stage?.name} required className={inputClass} placeholder="Madrid – Cercedilla por el Alto del León" /></Field>
      <Field label="Fecha" name="date"><input name="date" type="date" defaultValue={toDay(stage?.date)} className={inputClass} /></Field>
      <Field label="Hora de salida" name="startTime"><input name="startTime" defaultValue={stage?.startTime ?? ""} className={inputClass} placeholder="08:00" /></Field>
      <Field label="Punto de salida" name="startPlace"><input name="startPlace" defaultValue={stage?.startPlace ?? ""} className={inputClass} /></Field>
      <Field label="Punto de llegada" name="endPlace"><input name="endPlace" defaultValue={stage?.endPlace ?? ""} className={inputClass} /></Field>
      <Field label="Distancia (km)" name="distanceKm" hint="Si subes GPX se calcula sola"><input name="distanceKm" type="number" step="0.1" min={0} defaultValue={stage?.distanceKm ?? ""} className={inputClass} /></Field>
      <Field label="Desnivel positivo (m)" name="elevationM" hint="Si subes GPX se calcula solo"><input name="elevationM" type="number" min={0} defaultValue={stage?.elevationM ?? ""} className={inputClass} /></Field>
      <Field label={stage?.gpxName ? `Archivo GPX (actual: ${stage.gpxName})` : "Archivo GPX"} name="gpx" className="sm:col-span-2"><input name="gpx" type="file" accept=".gpx,application/gpx+xml" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink-950 file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white" /></Field>
      <Field label="Descripción del recorrido (markdown)" name="description" className="sm:col-span-2"><textarea name="description" defaultValue={stage?.description ?? ""} className={textareaClass} /></Field>
      <Field label="Horario de la etapa (Hora | Qué | Lugar, una línea por punto)" name="schedule" className="sm:col-span-2"><textarea name="schedule" defaultValue={stage?.schedule ?? ""} className={`${textareaClass} font-mono text-sm`} placeholder={"08:00 | Salida | Parque Central\n11:30 | Avituallamiento | Alto del León"} /></Field>
      <Field label="Orden" name="order"><input name="order" type="number" min={0} defaultValue={stage?.order ?? ""} className={inputClass} /></Field>
      <div className="sm:col-span-2"><button className={smallBtn}>{stage ? "Guardar etapa" : "Añadir etapa"}</button></div>
    </form>
  );
}
