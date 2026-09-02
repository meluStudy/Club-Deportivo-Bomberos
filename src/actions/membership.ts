"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { startCheckout } from "@/lib/payments";
import { currentSeason } from "@/lib/utils";

export async function joinMembershipAction(formData: FormData) {
  const user = await requireUser();
  const planSlug = String(formData.get("plan") ?? "");
  const plan = await prisma.membershipPlan.findUnique({ where: { slug: planSlug } });
  if (!plan || !plan.active) redirect("/socios?error=plan");

  const season = currentSeason();
  const existing = await prisma.membership.findUnique({ where: { userId_season: { userId: user.id, season } } });
  if (existing?.status === "ACTIVE") redirect("/cuenta?info=ya-socio");

  const last = await prisma.membership.findFirst({ orderBy: { memberNumber: "desc" }, select: { memberNumber: true } });
  const membership = existing
    ? await prisma.membership.update({ where: { id: existing.id }, data: { planId: plan.id, amountCents: plan.priceCents } })
    : await prisma.membership.create({
        data: {
          userId: user.id,
          season,
          planId: plan.id,
          memberNumber: (last?.memberNumber ?? 1000) + 1,
          amountCents: plan.priceCents,
          startsAt: new Date(`${season}-01-01`),
          expiresAt: new Date(`${season}-12-31T23:59:59`),
        },
      });

  const url = await startCheckout({
    type: "MEMBERSHIP",
    referenceId: membership.id,
    userId: user.id,
    email: user.email,
    items: [{ name: `Cuota de socio ${season} · ${plan.name}`, description: "Club Deportivo Bomberos de Madrid", amountCents: plan.priceCents, quantity: 1 }],
    successPath: "/cuenta?pago=socio",
    cancelPath: "/socios?cancelado=1",
  });
  redirect(url);
}

/** Renovación para la temporada siguiente (o la actual si ha caducado). */
export async function renewMembershipAction(formData: FormData) {
  const user = await requireUser();
  const current = await prisma.membership.findFirst({ where: { userId: user.id }, orderBy: { season: "desc" }, include: { plan: true } });
  const planSlug = String(formData.get("plan") ?? current?.plan.slug ?? "");
  const plan = await prisma.membershipPlan.findUnique({ where: { slug: planSlug } });
  if (!plan) redirect("/socios?error=plan");

  const season = current && current.season >= currentSeason() && current.status === "ACTIVE" ? current.season + 1 : currentSeason();
  const existing = await prisma.membership.findUnique({ where: { userId_season: { userId: user.id, season } } });
  if (existing?.status === "ACTIVE") redirect("/cuenta?info=ya-renovado");

  const last = await prisma.membership.findFirst({ orderBy: { memberNumber: "desc" }, select: { memberNumber: true } });
  const membership =
    existing ??
    (await prisma.membership.create({
      data: {
        userId: user.id,
        season,
        planId: plan.id,
        memberNumber: current?.memberNumber ?? (last?.memberNumber ?? 1000) + 1,
        amountCents: plan.priceCents,
        startsAt: new Date(`${season}-01-01`),
        expiresAt: new Date(`${season}-12-31T23:59:59`),
      },
    }));

  const url = await startCheckout({
    type: "MEMBERSHIP",
    referenceId: membership.id,
    userId: user.id,
    email: user.email,
    items: [{ name: `Renovación cuota ${season} · ${plan.name}`, amountCents: plan.priceCents, quantity: 1 }],
    successPath: "/cuenta?pago=renovacion",
    cancelPath: "/cuenta?cancelado=1",
  });
  redirect(url);
}
