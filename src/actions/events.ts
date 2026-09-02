"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getActiveMembership } from "@/lib/data";
import { startCheckout } from "@/lib/payments";

export async function registerForEventAction(formData: FormData) {
  const user = await requireUser();
  const slug = String(formData.get("slug") ?? "");
  const notes = String(formData.get("notes") ?? "").slice(0, 500) || null;

  const event = await prisma.event.findUnique({ where: { slug }, include: { _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } } });
  if (!event || !event.published) redirect("/eventos");
  if (event.registrationDeadline && event.registrationDeadline < new Date()) redirect(`/eventos/${slug}?error=cerrado`);
  if (event.capacity && event._count.registrations >= event.capacity) redirect(`/eventos/${slug}?error=completo`);

  const existing = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: event.id, userId: user.id } } });
  if (existing?.status === "CONFIRMED") redirect(`/eventos/${slug}?info=inscrito`);

  const membership = await getActiveMembership(user.id);
  const amountCents = membership && event.memberPriceCents != null ? event.memberPriceCents : event.priceCents;

  const registration = existing
    ? await prisma.eventRegistration.update({ where: { id: existing.id }, data: { status: "PENDING", amountCents, notes } })
    : await prisma.eventRegistration.create({ data: { eventId: event.id, userId: user.id, amountCents, notes } });

  const url = await startCheckout({
    type: "EVENT",
    referenceId: registration.id,
    userId: user.id,
    email: user.email,
    items: [{ name: `Inscripción · ${event.title}`, description: event.location, amountCents, quantity: 1 }],
    successPath: `/eventos/${slug}?pago=ok`,
    cancelPath: `/eventos/${slug}?cancelado=1`,
  });
  redirect(url);
}

export async function cancelRegistrationAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.eventRegistration.updateMany({ where: { id, userId: user.id, status: { not: "CANCELLED" } }, data: { status: "CANCELLED" } });
  redirect("/cuenta?info=inscripcion-cancelada");
}
