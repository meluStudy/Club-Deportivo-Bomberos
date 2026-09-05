import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isAdmin, requireStaff } from "@/lib/auth";
import { AdminHeader, Details, Table, th, td, smallBtn } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Alert, Field, inputClass, textareaClass } from "@/components/ui/form";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { createEventAction } from "@/actions/event-admin";
import { EVENT_TEMPLATES } from "@/lib/event-page";

export default async function AdminEvents({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const staff = await requireStaff();
  const admin = isAdmin(staff);
  const [events, sections] = await Promise.all([
    prisma.event.findMany({
      where: admin ? {} : { sectionId: staff.managedSectionId },
      orderBy: { startsAt: "desc" },
      include: { section: true, stages: { select: { id: true } }, _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } },
    }),
    prisma.section.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <AdminHeader title="Eventos" description={admin ? "Todos los eventos del club y sus microwebs." : `Eventos de la sección de ${staff.managedSection?.name}.`} />
      {sp.error === "permiso" && <div className="mb-6"><Alert tone="error">No tienes permiso para gestionar ese evento.</Alert></div>}
      {sp.error === "titulo" && <div className="mb-6"><Alert tone="error">El título es obligatorio.</Alert></div>}

      <Details summary="➕ Crear evento (elige una plantilla)">
        <form action={createEventAction} className="grid gap-4 sm:grid-cols-2">
          <Field label="Título" name="title" className="sm:col-span-2"><input id="title" name="title" required className={inputClass} placeholder="Marcha Ciclista Bomberos" /></Field>
          <Field label="Plantilla" name="template" className="sm:col-span-2">
            <div className="grid gap-3 sm:grid-cols-3">
              {EVENT_TEMPLATES.map((t, i) => (
                <label key={t.key} className="flex cursor-pointer flex-col gap-1 rounded-xl border border-ink-200 p-4 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
                  <span className="flex items-center gap-2"><input type="radio" name="template" value={t.key} defaultChecked={i === 0} className="accent-brand-600" /><span className="font-bold">{t.name}</span></span>
                  <span className="text-xs text-ink-600">{t.description}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="URL (slug)" name="slug" hint="Se publica en /nombre-evento. Vacío = se genera del título"><input id="slug" name="slug" className={inputClass} placeholder="marcha-ciclista-bomberos" /></Field>
          {admin ? (
            <Field label="Sección" name="sectionId">
              <select id="sectionId" name="sectionId" className={inputClass} defaultValue="">
                <option value="">Club (general)</option>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Sección" name="sectionName"><input id="sectionName" disabled value={staff.managedSection?.name ?? ""} className={inputClass} /></Field>
          )}
          <Field label="Fecha y hora de inicio" name="startsAt"><input id="startsAt" name="startsAt" type="datetime-local" className={inputClass} /></Field>
          <Field label="Lugar" name="location"><input id="location" name="location" className={inputClass} placeholder="Parque Central de Bomberos" /></Field>
          <Field label="Precio general (€)" name="price"><input id="price" name="price" type="number" step="0.01" min={0} defaultValue={0} className={inputClass} /></Field>
          <Field label="Precio socios (€, opcional)" name="memberPrice"><input id="memberPrice" name="memberPrice" type="number" step="0.01" min={0} className={inputClass} /></Field>
          <Field label="Plazas (vacío = ilimitadas)" name="capacity"><input id="capacity" name="capacity" type="number" min={1} className={inputClass} /></Field>
          <Field label="Descripción corta (tarjetas y listados)" name="description" className="sm:col-span-2"><textarea id="description" name="description" className={textareaClass} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" className="size-5 accent-brand-600 sm:size-4" /> Publicar ya (si no, queda como borrador visible solo para el panel)</label>
          <div className="sm:col-span-2"><button className={smallBtn}>Crear evento y abrir editor</button></div>
        </form>
      </Details>

      <Table className="mt-8">
        <thead><tr><th className={th}>Evento</th><th className={th}>Fecha</th><th className={th}>Sección</th><th className={th}>Precio</th><th className={th}>Inscritos</th><th className={th}>Estado</th><th className={th}></th></tr></thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td className={td}><Link href={`/admin/eventos/${e.id}`} className="font-semibold hover:text-brand-600">{e.title}</Link><br /><Link href={`/${e.slug}`} className="text-xs text-ink-500 underline" target="_blank">/{e.slug}</Link></td>
              <td className={td}>{formatDateTime(e.startsAt)}</td>
              <td className={td}>{e.section?.name ?? "Club"}</td>
              <td className={td}>{formatPrice(e.priceCents)}{e.memberPriceCents != null && <span className="text-ink-500"> / {formatPrice(e.memberPriceCents)}</span>}</td>
              <td className={td}>{e._count.registrations}{e.capacity ? ` / ${e.capacity}` : ""}</td>
              <td className={td}>{e.published ? <Badge tone="success">Publicado</Badge> : <Badge tone="neutral">Borrador</Badge>}{e.stages.length > 0 && <Badge tone="soft" className="ml-1">{e.stages.length} etapas</Badge>}</td>
              <td className={td}><Link href={`/admin/eventos/${e.id}`} className={smallBtn + " inline-flex items-center"}>Editar</Link></td>
            </tr>
          ))}
          {events.length === 0 && <tr><td className={td} colSpan={7}><span className="text-ink-500">Todavía no hay eventos. Crea el primero con la plantilla.</span></td></tr>}
        </tbody>
      </Table>
    </>
  );
}
