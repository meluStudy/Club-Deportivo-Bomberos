import "server-only";
import { prisma } from "./prisma";

export type TicketOption = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  memberPriceCents: number | null;
  capacity: number | null;
  taken: number;
  soldOut: boolean;
};

/** Precio aplicable a una modalidad según si el usuario es socio. */
export function ticketPrice(t: { priceCents: number; memberPriceCents: number | null }, isMember: boolean) {
  return isMember && t.memberPriceCents != null ? t.memberPriceCents : t.priceCents;
}

/** Modalidades activas de un evento con las plazas ya ocupadas de cada una. */
export async function getEventTickets(eventId: string): Promise<TicketOption[]> {
  const [tickets, counts] = await Promise.all([
    prisma.eventTicket.findMany({ where: { eventId, active: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    prisma.eventRegistration.groupBy({
      by: ["ticketId"],
      where: { eventId, status: "CONFIRMED" },
      _count: { _all: true },
    }),
  ]);
  return tickets.map((t) => {
    const taken = counts.find((c) => c.ticketId === t.id)?._count._all ?? 0;
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      priceCents: t.priceCents,
      memberPriceCents: t.memberPriceCents,
      capacity: t.capacity,
      taken,
      soldOut: t.capacity != null && taken >= t.capacity,
    };
  });
}

/** Desglose de inscritos y recaudación por modalidad, para el panel. */
export async function getTicketBreakdown(eventId: string) {
  const [tickets, regs] = await Promise.all([
    prisma.eventTicket.findMany({ where: { eventId }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    prisma.eventRegistration.findMany({ where: { eventId }, select: { ticketId: true, ticketName: true, status: true, amountCents: true } }),
  ]);

  const rowFor = (id: string | null) => regs.filter((r) => r.ticketId === id);
  const summarise = (list: typeof regs) => ({
    confirmed: list.filter((r) => r.status === "CONFIRMED").length,
    pending: list.filter((r) => r.status === "PENDING").length,
    cancelled: list.filter((r) => r.status === "CANCELLED").length,
    revenueCents: list.filter((r) => r.status === "CONFIRMED").reduce((n, r) => n + r.amountCents, 0),
  });

  const rows = tickets.map((t) => ({
    id: t.id,
    name: t.name,
    capacity: t.capacity,
    priceCents: t.priceCents,
    memberPriceCents: t.memberPriceCents,
    active: t.active,
    ...summarise(rowFor(t.id)),
  }));

  // Inscripciones sin modalidad (eventos sin modalidades o modalidades eliminadas)
  const orphan = regs.filter((r) => !r.ticketId || !tickets.some((t) => t.id === r.ticketId));
  const totals = summarise(regs);
  return {
    rows,
    orphan: orphan.length ? { name: "Sin modalidad", ...summarise(orphan) } : null,
    totals,
  };
}
