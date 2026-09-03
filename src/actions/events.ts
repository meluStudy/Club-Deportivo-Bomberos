"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getActiveMembership } from "@/lib/data";
import { getEventTickets, ticketPrice } from "@/lib/tickets";
import { CAMPOS_PARTICIPANTE, type CampoParticipante } from "@/lib/validators";
import { parseJson } from "@/lib/utils";
import { startCheckout } from "@/lib/payments";

export async function registerForEventAction(formData: FormData) {
  const user = await requireUser();
  const slug = String(formData.get("slug") ?? "");
  const notes = String(formData.get("notes") ?? "").slice(0, 500) || null;
  const rt = String(formData.get("returnTo") ?? "");
  const back = rt.startsWith("/") && !rt.startsWith("//") ? rt : `/${slug}`;

  const event = await prisma.event.findUnique({ where: { slug }, include: { _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } } });
  if (!event || !event.published) redirect("/eventos");
  if (event.registrationDeadline && event.registrationDeadline < new Date()) redirect(`${back}?error=cerrado`);
  if (event.capacity && event._count.registrations >= event.capacity) redirect(`${back}?error=completo`);

  const existing = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: event.id, userId: user.id } } });
  if (existing?.status === "CONFIRMED") redirect(`${back}?info=inscrito`);

  const membership = await getActiveMembership(user.id);
  const isMember = Boolean(membership);

  // Si el evento tiene modalidades, el precio y las plazas salen de la elegida
  const tickets = await getEventTickets(event.id);
  const chosenId = String(formData.get("ticketId") ?? "");
  let ticket = tickets.find((t) => t.id === chosenId) ?? null;
  if (tickets.length > 0) {
    if (!ticket) {
      // Sin elección válida: si solo hay una modalidad se toma esa, si no se pide elegir
      if (tickets.length === 1) ticket = tickets[0];
      else redirect(`${back}?error=modalidad`);
    }
    if (ticket!.soldOut) redirect(`${back}?error=modalidad-completa`);
  }

  const amountCents = ticket ? ticketPrice(ticket, isMember) : isMember && event.memberPriceCents != null ? event.memberPriceCents : event.priceCents;
  const ticketData = { ticketId: ticket?.id ?? null, ticketName: ticket?.name ?? null };

  // Datos del participante que pide este evento
  const pedidos = parseJson<CampoParticipante[]>(event.requiredFields, []);
  const datos: Record<string, string | Date | null> = {};
  const faltan: string[] = [];
  for (const campo of pedidos) {
    if (!(campo in CAMPOS_PARTICIPANTE)) continue;
    const valor = String(formData.get(campo) ?? "").trim().slice(0, 300);
    if (!valor) {
      // Las notas médicas son opcionales aunque se pidan
      if (campo !== "medicalNotes") faltan.push(campo);
      datos[campo] = null;
      continue;
    }
    datos[campo] = campo === "birthDate" ? new Date(valor) : valor;
  }
  if (faltan.length) redirect(`${back}?error=datos&campos=${faltan.join(",")}`);

  // Se guardan también en el perfil, para no volver a pedirlos la próxima vez
  const perfil: Record<string, string | Date | null> = {};
  for (const k of ["dni", "birthDate", "shirtSize", "clubName", "licenseNumber", "emergencyName", "emergencyPhone"] as const) {
    if (datos[k]) perfil[k] = datos[k];
  }
  if (Object.keys(perfil).length) await prisma.user.update({ where: { id: user.id }, data: perfil });

  const registration = existing
    ? await prisma.eventRegistration.update({ where: { id: existing.id }, data: { status: "PENDING", amountCents, notes, ...ticketData, ...datos } })
    : await prisma.eventRegistration.create({ data: { eventId: event.id, userId: user.id, amountCents, notes, ...ticketData, ...datos } });

  const url = await startCheckout({
    type: "EVENT",
    referenceId: registration.id,
    userId: user.id,
    email: user.email,
    items: [{ name: `Inscripción · ${event.title}`, description: ticket ? `${ticket.name} · ${event.location}` : event.location, amountCents, quantity: 1 }],
    successPath: `${back}?pago=ok`,
    cancelPath: `${back}?cancelado=1`,
  });
  redirect(url);
}

export async function cancelRegistrationAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.eventRegistration.updateMany({ where: { id, userId: user.id, status: { not: "CANCELLED" } }, data: { status: "CANCELLED" } });
  redirect("/cuenta?info=inscripcion-cancelada");
}
