import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarDays, LogOut, Package, RefreshCw, Ticket, UserRound } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/form";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveMembership, getPlans } from "@/lib/data";
import { logoutAction } from "@/actions/auth";
import { renewMembershipAction } from "@/actions/membership";
import { cancelRegistrationAction } from "@/actions/events";
import { currentSeason, formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi cuenta" };
export const dynamic = "force-dynamic";

const statusLabel: Record<string, { label: string; tone: "success" | "warning" | "neutral" }> = {
  PENDING: { label: "Pendiente de pago", tone: "warning" },
  PAID: { label: "Pagado", tone: "success" },
  SHIPPED: { label: "Enviado", tone: "success" },
  DELIVERED: { label: "Entregado", tone: "success" },
  CANCELLED: { label: "Cancelado", tone: "neutral" },
  CONFIRMED: { label: "Confirmada", tone: "success" },
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await requireUser();
  const [membership, history, registrations, orders, plans] = await Promise.all([
    getActiveMembership(user.id),
    prisma.membership.findMany({ where: { userId: user.id }, orderBy: { season: "desc" }, include: { plan: true } }),
    prisma.eventRegistration.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { event: true } }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } }),
    getPlans(),
  ]);
  const season = currentSeason();
  const nextSeasonPaid = history.some((m) => m.season === season + 1 && m.status === "ACTIVE");

  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Mi cuenta</p>
          <h1 className="text-5xl font-extrabold uppercase">Hola, {user.name.split(" ")[0]}</h1>
        </div>
        <div className="flex gap-2">
          {user.role === "ADMIN" && <ButtonLink href="/admin" variant="dark" size="sm">Panel de administración</ButtonLink>}
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm"><LogOut className="size-4" /> Cerrar sesión</Button>
          </form>
        </div>
      </div>

      <div className="mb-8 space-y-3">
        {sp.pago === "socio" && <Alert tone="success">¡Bienvenido al club! Tu cuota de socio se ha registrado correctamente.</Alert>}
        {sp.pago === "renovacion" && <Alert tone="success">Renovación completada. ¡Gracias por seguir un año más!</Alert>}
        {sp.info === "ya-socio" && <Alert>Ya tienes una cuota activa para esta temporada.</Alert>}
        {sp.info === "inscripcion-cancelada" && <Alert>Inscripción cancelada.</Alert>}
        {sp.cancelado && <Alert tone="error">El pago se ha cancelado.</Alert>}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Carné */}
        <Reveal className="min-w-0 lg:col-span-5">
          <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-7 text-white shadow-glow">
            <div className="absolute inset-0 bg-stripes" aria-hidden />
            <div className="absolute -right-16 -top-16 size-56 rounded-full bg-brand-600/40 blur-2xl" aria-hidden />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">Club Deportivo Bomberos de Madrid</p>
                  <h2 className="mt-2 text-3xl font-extrabold uppercase leading-none">{membership ? "Carné de socio" : "Sin cuota activa"}</h2>
                </div>
                {membership && <BadgeCheck className="size-8 text-brand-500" />}
              </div>
              <p className="mt-6 text-2xl font-bold">{user.name}</p>
              {membership ? (
                <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div><dt className="text-ink-400">Nº socio</dt><dd className="font-display text-2xl font-bold">{membership.memberNumber}</dd></div>
                  <div><dt className="text-ink-400">Temporada</dt><dd className="font-display text-2xl font-bold">{membership.season}</dd></div>
                  <div><dt className="text-ink-400">Modalidad</dt><dd className="font-semibold">{membership.plan.name}</dd></div>
                </dl>
              ) : (
                <p className="mt-3 text-ink-300">Hazte socio para acceder a todas las secciones, descuentos y seguro deportivo.</p>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                {!membership && <ButtonLink href="/socios" size="sm">Hazte socio</ButtonLink>}
                {membership && !nextSeasonPaid && (
                  <form action={renewMembershipAction} className="flex flex-wrap items-center gap-2">
                    <select name="plan" defaultValue={membership.plan.slug} className="h-9 rounded-full border border-white/20 bg-ink-900 px-3 text-sm" aria-label="Modalidad de renovación">
                      {plans.map((p) => (
                        <option key={p.slug} value={p.slug}>{p.name} · {formatPrice(p.priceCents)}</option>
                      ))}
                    </select>
                    <Button type="submit" size="sm"><RefreshCw className="size-4" /> Renovar temporada {membership.season + 1}</Button>
                  </form>
                )}
                {nextSeasonPaid && <Badge tone="success">Temporada {season + 1} renovada</Badge>}
              </div>
              {membership && <p className="mt-4 text-xs text-ink-400">Válido hasta el {formatDate(membership.expiresAt)}</p>}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-ink-100 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-xl font-bold uppercase"><UserRound className="size-5 text-brand-600" /> Datos personales</h3>
            <dl className="space-y-1 text-sm text-ink-700">
              <div className="flex justify-between"><dt className="text-ink-500">Correo</dt><dd>{user.email}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Teléfono</dt><dd>{user.phone ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Perfil</dt><dd>{user.role === "ADMIN" ? "Administrador" : user.role === "SOCIO" ? "Socio" : "Participante"}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">Bombero</dt><dd>{user.isFirefighter ? "Sí" : "No"}</dd></div>
            </dl>
          </div>

          {history.length > 0 && (
            <div className="mt-6 rounded-2xl border border-ink-100 p-6">
              <h3 className="mb-3 text-xl font-bold uppercase">Historial de cuotas</h3>
              <ul className="divide-y divide-ink-100 text-sm">
                {history.map((m) => (
                  <li key={m.id} className="flex items-center justify-between py-2">
                    <span>Temporada {m.season} · {m.plan.name}</span>
                    <span className="flex items-center gap-2">{formatPrice(m.amountCents)} <Badge tone={m.status === "ACTIVE" ? "success" : m.status === "PENDING" ? "warning" : "neutral"}>{m.status === "ACTIVE" ? "Pagada" : m.status === "PENDING" ? "Pendiente" : "Caducada"}</Badge></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>

        <div className="min-w-0 space-y-8 lg:col-span-7">
          <Reveal className="rounded-2xl border border-ink-100 p-6" delay={0.1}>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold uppercase"><Ticket className="size-5 text-brand-600" /> Mis inscripciones</h2>
            {registrations.length === 0 ? (
              <p className="text-ink-500">Todavía no te has inscrito en ningún evento. <Link href="/eventos" className="text-brand-600 underline">Ver eventos</Link></p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {registrations.map((r) => (
                  <li key={r.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link href={`/${r.event.slug}`} className="font-semibold hover:text-brand-600">{r.event.title}</Link>
                      <p className="flex items-center gap-1 text-sm text-ink-500"><CalendarDays className="size-3.5" /> {formatDate(r.event.startsAt, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={statusLabel[r.status]?.tone ?? "neutral"}>{statusLabel[r.status]?.label ?? r.status}</Badge>
                      {r.status !== "CANCELLED" && r.event.startsAt > new Date() && (
                        <form action={cancelRegistrationAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="text-xs text-ink-500 underline hover:text-brand-600">Cancelar</button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          <Reveal className="rounded-2xl border border-ink-100 p-6" delay={0.2}>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold uppercase"><Package className="size-5 text-brand-600" /> Mis pedidos</h2>
            {orders.length === 0 ? (
              <p className="text-ink-500">Aún no has realizado ningún pedido. <Link href="/tienda" className="text-brand-600 underline">Ir a la tienda</Link></p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {orders.map((o) => (
                  <li key={o.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link href={`/tienda/pedido/${o.id}`} className="font-semibold hover:text-brand-600">Pedido {o.id.slice(-8).toUpperCase()}</Link>
                      <p className="text-sm text-ink-500">{formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} artículos · {o.shippingMethod === "envio" ? "Envío" : "Recogida"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl font-bold">{formatPrice(o.totalCents)}</span>
                      <Badge tone={statusLabel[o.status]?.tone ?? "neutral"}>{statusLabel[o.status]?.label ?? o.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>
      </div>
    </Container>
  );
}
