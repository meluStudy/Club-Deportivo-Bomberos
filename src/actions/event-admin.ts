"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canManageSection, isAdmin, requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { getTemplate, parseGpx, EVENT_TABS, type EventTabKey } from "@/lib/event-page";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => Number(String(fd.get(k) ?? "0").replace(",", "."));
const cents = (fd: FormData, k: string) => Math.round(num(fd, k) * 100);
const optCents = (fd: FormData, k: string) => (str(fd, k) === "" ? null : cents(fd, k));
const opt = (fd: FormData, k: string) => str(fd, k) || null;

function refresh(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/${slug}`, "layout");
}

async function loadEvent(id: string) {
  const staff = await requireStaff();
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event || !canManageSection(staff, event.sectionId)) redirect("/admin/eventos?error=permiso");
  return { staff, event: event! };
}

/** Crear evento (opcionalmente desde plantilla). Los responsables solo en su sección. */
export async function createEventAction(formData: FormData) {
  const staff = await requireStaff();
  const title = str(formData, "title");
  if (!title) redirect("/admin/eventos?error=titulo");
  const sectionId = isAdmin(staff) ? opt(formData, "sectionId") : staff.managedSectionId;
  if (!canManageSection(staff, sectionId)) redirect("/admin/eventos?error=permiso");

  let slug = str(formData, "slug") || slugify(title);
  const clash = await prisma.event.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const template = getTemplate(str(formData, "template"));
  const startsAt = str(formData, "startsAt") ? new Date(str(formData, "startsAt")) : new Date(Date.now() + 30 * 86400000);

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      sectionId,
      startsAt,
      location: str(formData, "location") || "Por confirmar",
      description: str(formData, "description") || template?.fields.intro || "",
      priceCents: cents(formData, "price"),
      memberPriceCents: optCents(formData, "memberPrice"),
      capacity: str(formData, "capacity") ? Math.floor(num(formData, "capacity")) : null,
      published: formData.get("published") === "on",
      ...(template?.fields ?? {}),
      stages: template
        ? { create: template.stages.map((s, i) => ({ order: i, name: s.name, startTime: s.startTime, startPlace: s.startPlace, endPlace: s.endPlace, distanceKm: s.distanceKm, elevationM: s.elevationM, description: s.description, schedule: s.schedule })) }
        : undefined,
    },
  });
  refresh(slug);
  redirect(`/admin/eventos/${event.id}`);
}

/** Datos básicos (ficha del evento). */
export async function updateEventBasicsAction(formData: FormData) {
  const { staff, event } = await loadEvent(str(formData, "id"));
  const sectionId = isAdmin(staff) ? opt(formData, "sectionId") : event.sectionId;
  const title = str(formData, "title") || event.title;
  const slug = str(formData, "slug") ? slugify(str(formData, "slug")) : event.slug;
  const clash = slug !== event.slug ? await prisma.event.findUnique({ where: { slug } }) : null;
  await prisma.event.update({
    where: { id: event.id },
    data: {
      title,
      slug: clash ? event.slug : slug,
      sectionId,
      description: str(formData, "description"),
      location: str(formData, "location"),
      startsAt: new Date(str(formData, "startsAt")),
      endsAt: str(formData, "endsAt") ? new Date(str(formData, "endsAt")) : null,
      registrationDeadline: str(formData, "deadline") ? new Date(str(formData, "deadline")) : null,
      priceCents: cents(formData, "price"),
      memberPriceCents: optCents(formData, "memberPrice"),
      capacity: str(formData, "capacity") ? Math.floor(num(formData, "capacity")) : null,
      coverImage: opt(formData, "image"),
      heroImage: opt(formData, "heroImage"),
      subtitle: opt(formData, "subtitle"),
      published: formData.get("published") === "on",
    },
  });
  refresh(event.slug);
  redirect(`/admin/eventos/${event.id}?ok=1`);
}

/** Contenido de una pestaña de la microweb. */
export async function updateEventTabAction(formData: FormData) {
  const { staff, event } = await loadEvent(str(formData, "id"));
  const tab = str(formData, "tab") as EventTabKey;
  if (!EVENT_TABS.some((t) => t.key === tab)) redirect(`/admin/eventos/${event.id}`);

  const data: Record<string, string | null> = {};
  switch (tab) {
    case "inicio":
      data.highlights = opt(formData, "highlights");
      data.intro = opt(formData, "intro");
      break;
    case "presentacion":
      data.presentation = opt(formData, "presentation");
      break;
    case "alojamiento":
      data.accommodation = opt(formData, "accommodation");
      data.accommodations = opt(formData, "accommodations");
      break;
    case "programa":
      data.program = opt(formData, "program");
      break;
    case "inscripciones":
      data.registrationInfo = opt(formData, "registrationInfo");
      break;
    case "contacto":
      data.contactName = opt(formData, "contactName");
      data.contactEmail = opt(formData, "contactEmail");
      data.contactPhone = opt(formData, "contactPhone");
      data.contactInfo = opt(formData, "contactInfo");
      break;
  }
  // HTML libre: solo administradores globales
  if (isAdmin(staff) && formData.has("customHtml")) {
    let html: Record<string, string> = {};
    try {
      html = event.customHtml ? JSON.parse(event.customHtml) : {};
    } catch {}
    const value = str(formData, "customHtml");
    if (value) html[tab] = value;
    else delete html[tab];
    data.customHtml = Object.keys(html).length ? JSON.stringify(html) : null;
  }
  await prisma.event.update({ where: { id: event.id }, data });
  refresh(event.slug);
  redirect(`/admin/eventos/${event.id}?tab=${tab}&ok=1`);
}

/** Crear o editar una etapa (con GPX opcional). */
export async function upsertStageAction(formData: FormData) {
  const { event } = await loadEvent(str(formData, "eventId"));
  const stageId = str(formData, "stageId");
  const file = formData.get("gpx");
  let gpx: { gpxName: string; gpxData: string; gpxStats: string; distanceKm?: number; elevationM?: number } | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > 6 * 1024 * 1024) redirect(`/admin/eventos/${event.id}?tab=etapas&error=gpx-grande`);
    const text = await file.text();
    const stats = parseGpx(text);
    if (!stats) redirect(`/admin/eventos/${event.id}?tab=etapas&error=gpx-invalido`);
    gpx = { gpxName: file.name, gpxData: text, gpxStats: JSON.stringify(stats), distanceKm: stats!.distanceKm, elevationM: stats!.elevationGain };
  }
  const data = {
    name: str(formData, "name") || "Etapa",
    date: str(formData, "date") ? new Date(str(formData, "date")) : null,
    startTime: opt(formData, "startTime"),
    startPlace: opt(formData, "startPlace"),
    endPlace: opt(formData, "endPlace"),
    // Si se sube un GPX, sus datos calculados mandan sobre los escritos a mano
    distanceKm: gpx?.distanceKm ?? (str(formData, "distanceKm") ? num(formData, "distanceKm") : null),
    elevationM: gpx?.elevationM ?? (str(formData, "elevationM") ? Math.round(num(formData, "elevationM")) : null),
    description: opt(formData, "description"),
    schedule: opt(formData, "schedule"),
    order: str(formData, "order") ? Math.floor(num(formData, "order")) : 0,
    ...(gpx ? { gpxName: gpx.gpxName, gpxData: gpx.gpxData, gpxStats: gpx.gpxStats } : {}),
  };
  if (stageId) {
    const stage = await prisma.eventStage.findUnique({ where: { id: stageId } });
    if (!stage || stage.eventId !== event.id) redirect(`/admin/eventos/${event.id}?tab=etapas`);
    await prisma.eventStage.update({ where: { id: stageId }, data });
  } else {
    const count = await prisma.eventStage.count({ where: { eventId: event.id } });
    await prisma.eventStage.create({ data: { ...data, eventId: event.id, order: data.order || count } });
  }
  refresh(event.slug);
  redirect(`/admin/eventos/${event.id}?tab=etapas&ok=1`);
}

export async function deleteStageAction(formData: FormData) {
  const { event } = await loadEvent(str(formData, "eventId"));
  await prisma.eventStage.deleteMany({ where: { id: str(formData, "stageId"), eventId: event.id } });
  refresh(event.slug);
  redirect(`/admin/eventos/${event.id}?tab=etapas`);
}

export async function removeStageGpxAction(formData: FormData) {
  const { event } = await loadEvent(str(formData, "eventId"));
  await prisma.eventStage.updateMany({ where: { id: str(formData, "stageId"), eventId: event.id }, data: { gpxName: null, gpxData: null, gpxStats: null } });
  refresh(event.slug);
  redirect(`/admin/eventos/${event.id}?tab=etapas`);
}

export async function deleteEventAction(formData: FormData) {
  const { event } = await loadEvent(str(formData, "id"));
  await prisma.event.delete({ where: { id: event.id } });
  refresh(event.slug);
  redirect("/admin/eventos");
}
