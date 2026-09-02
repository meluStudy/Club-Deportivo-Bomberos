import { prisma } from "@/lib/prisma";
import { AdminHeader, Stat, Table, th, td, smallBtn } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { currentSeason, formatDate, formatPrice } from "@/lib/utils";
import { markMembershipPaidAction } from "@/actions/admin";
import Link from "next/link";

export default async function AdminMembers({ searchParams }: { searchParams: Promise<{ temporada?: string; estado?: string }> }) {
  const sp = await searchParams;
  const season = Number(sp.temporada) || currentSeason();
  const status = sp.estado as "ACTIVE" | "PENDING" | "EXPIRED" | undefined;
  const [memberships, seasons, counts] = await Promise.all([
    prisma.membership.findMany({ where: { season, ...(status ? { status } : {}) }, orderBy: { memberNumber: "asc" }, include: { user: true, plan: true } }),
    prisma.membership.findMany({ distinct: ["season"], select: { season: true }, orderBy: { season: "desc" } }),
    prisma.membership.groupBy({ by: ["status"], where: { season }, _count: { _all: true } }),
  ]);
  const c = (s: string) => counts.find((x) => x.status === s)?._count._all ?? 0;

  return (
    <>
      <AdminHeader title="Socios" description="Recuento y gestión de cuotas por temporada." action={
        <div className="flex gap-2">
          {seasons.map((s) => (
            <Link key={s.season} href={`/admin/socios?temporada=${s.season}`} className={`rounded-full px-4 py-2 text-sm font-bold ${s.season === season ? "bg-brand-600 text-white" : "bg-white text-ink-700"}`}>{s.season}</Link>
          ))}
        </div>
      } />
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href={`/admin/socios?temporada=${season}&estado=ACTIVE`}><Stat label="Activos" value={c("ACTIVE")} accent /></Link>
        <Link href={`/admin/socios?temporada=${season}&estado=PENDING`}><Stat label="Pendientes de pago" value={c("PENDING")} /></Link>
        <Link href={`/admin/socios?temporada=${season}`}><Stat label="Total temporada" value={memberships.length && !status ? memberships.length : c("ACTIVE") + c("PENDING") + c("EXPIRED") + c("CANCELLED")} /></Link>
      </div>
      <Table className="mt-8">
        <thead><tr><th className={th}>Nº</th><th className={th}>Socio</th><th className={th}>Contacto</th><th className={th}>Modalidad</th><th className={th}>Cuota</th><th className={th}>Estado</th><th className={th}>Pago</th><th className={th}></th></tr></thead>
        <tbody>
          {memberships.map((m) => (
            <tr key={m.id}>
              <td className={td}><strong>{m.memberNumber}</strong></td>
              <td className={td}>{m.user.name}{m.user.isFirefighter && <Badge tone="soft" className="ml-2">Bombero</Badge>}</td>
              <td className={td}><span className="block">{m.user.email}</span><span className="text-ink-500">{m.user.phone ?? ""}</span></td>
              <td className={td}>{m.plan.name}</td>
              <td className={td}>{formatPrice(m.amountCents)}</td>
              <td className={td}><Badge tone={m.status === "ACTIVE" ? "success" : m.status === "PENDING" ? "warning" : "neutral"}>{m.status === "ACTIVE" ? "Activo" : m.status === "PENDING" ? "Pendiente" : m.status === "EXPIRED" ? "Caducado" : "Cancelado"}</Badge></td>
              <td className={td}>{m.paidAt ? formatDate(m.paidAt) : "—"}</td>
              <td className={td}>
                {m.status === "PENDING" && (
                  <form action={markMembershipPaidAction}><input type="hidden" name="id" value={m.id} /><button className={smallBtn}>Marcar pagado</button></form>
                )}
              </td>
            </tr>
          ))}
          {memberships.length === 0 && <tr><td className={td} colSpan={8}><span className="text-ink-500">No hay socios con este filtro.</span></td></tr>}
        </tbody>
      </Table>
    </>
  );
}
