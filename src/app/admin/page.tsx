import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminHeader, Panel, Stat } from "@/components/admin/ui";
import { currentSeason, formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const season = currentSeason();
  const [activeMembers, pendingMembers, lastSeason, byPlan, revenue, revenueByType, orders, pendingOrders, lowStock, upcomingEvents, unread, recentPayments, usersCount] = await Promise.all([
    prisma.membership.count({ where: { season, status: "ACTIVE" } }),
    prisma.membership.count({ where: { season, status: "PENDING" } }),
    prisma.membership.count({ where: { season: season - 1, status: { in: ["ACTIVE", "EXPIRED"] } } }),
    prisma.membership.groupBy({ by: ["planId"], where: { season, status: "ACTIVE" }, _count: { _all: true } }),
    prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amountCents: true } }),
    prisma.payment.groupBy({ by: ["type"], where: { status: "SUCCEEDED" }, _sum: { amountCents: true }, _count: { _all: true } }),
    prisma.order.count({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.productVariant.findMany({ where: { stock: { lte: 5 } }, include: { product: true }, orderBy: { stock: "asc" }, take: 8 }),
    prisma.event.findMany({ where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 5, include: { _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.payment.findMany({ where: { status: "SUCCEEDED" }, orderBy: { updatedAt: "desc" }, take: 8, include: { user: { select: { name: true } } } }),
    prisma.user.count(),
  ]);
  const plans = await prisma.membershipPlan.findMany();
  const typeLabel = { MEMBERSHIP: "Cuotas de socio", EVENT: "Inscripciones", ORDER: "Tienda" } as const;

  return (
    <>
      <AdminHeader title="Resumen del club" description={`Temporada ${season} · datos en tiempo real`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={`Socios activos ${season}`} value={activeMembers} sub={`${pendingMembers} pendientes de pago · ${lastSeason} en ${season - 1}`} accent />
        <Stat label="Ingresos totales" value={formatPrice(revenue._sum.amountCents ?? 0)} sub="pagos completados" />
        <Stat label="Pedidos de tienda" value={orders} sub={`${pendingOrders} por preparar`} />
        <Stat label="Usuarios registrados" value={usersCount} sub={`${unread} mensajes sin leer`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Recuento de socios por modalidad">
          <ul className="divide-y divide-ink-100">
            {plans.map((p) => {
              const c = byPlan.find((b) => b.planId === p.id)?._count._all ?? 0;
              const pct = activeMembers ? Math.round((c / activeMembers) * 100) : 0;
              return (
                <li key={p.id} className="py-3">
                  <div className="flex items-center justify-between text-sm"><span className="font-semibold">{p.name}</span><span>{c} socios · {pct}%</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} /></div>
                </li>
              );
            })}
          </ul>
          <Link href="/admin/socios" className="mt-4 inline-block text-sm font-semibold text-brand-600 underline">Ver listado de socios</Link>
        </Panel>

        <Panel title="Ingresos por concepto">
          <ul className="divide-y divide-ink-100">
            {(["MEMBERSHIP", "EVENT", "ORDER"] as const).map((t) => {
              const r = revenueByType.find((x) => x.type === t);
              return (
                <li key={t} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-semibold">{typeLabel[t]}</span>
                  <span>{r?._count._all ?? 0} pagos · <strong>{formatPrice(r?._sum.amountCents ?? 0)}</strong></span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Próximos eventos">
          <ul className="divide-y divide-ink-100 text-sm">
            {upcomingEvents.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <span><span className="font-semibold">{e.title}</span><br /><span className="text-ink-500">{formatDate(e.startsAt)}</span></span>
                <Badge tone={e.capacity && e._count.registrations >= e.capacity ? "neutral" : "success"}>{e._count.registrations}{e.capacity ? ` / ${e.capacity}` : ""} inscritos</Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Stock bajo (≤ 5 uds.)">
          {lowStock.length === 0 ? <p className="text-sm text-ink-500">Todo el stock está por encima del mínimo.</p> : (
            <ul className="divide-y divide-ink-100 text-sm">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between py-2">
                  <span>{v.product.name} <span className="text-ink-500">· {[v.color, v.size].filter(Boolean).join(" · ")}</span></span>
                  <Badge tone={v.stock === 0 ? "brand" : "warning"}>{v.stock} uds.</Badge>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/tienda" className="mt-4 inline-block text-sm font-semibold text-brand-600 underline">Gestionar stock</Link>
        </Panel>

        <Panel title="Últimos pagos" className="lg:col-span-2">
          <ul className="divide-y divide-ink-100 text-sm">
            {recentPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span>{typeLabel[p.type]} · {p.user?.name ?? "Invitado"} <span className="text-ink-400">· {p.provider}</span></span>
                <span>{formatDate(p.updatedAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · <strong>{formatPrice(p.amountCents)}</strong></span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
