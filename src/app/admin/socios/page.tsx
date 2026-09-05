import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader, Stat, Table, th, td, smallBtn } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { currentSeason, formatDate, formatPrice } from "@/lib/utils";
import { markMembershipPaidAction } from "@/actions/admin";
import { enviarAvisosRenovacionAction, sociosPendientesDeRenovar } from "@/actions/renewals";
import { ExportButton } from "@/components/admin/export-button";
import { Alert } from "@/components/ui/form";
import { mailConfigurado } from "@/lib/mail";
import { MailWarning, Send } from "lucide-react";
import Link from "next/link";

export default async function AdminMembers({ searchParams }: { searchParams: Promise<{ temporada?: string; estado?: string; avisos?: string; total?: string }> }) {
  const sp = await searchParams;
  await requireAdmin();
  const season = Number(sp.temporada) || currentSeason();
  const status = sp.estado as "ACTIVE" | "PENDING" | "EXPIRED" | undefined;
  const [memberships, seasons, counts] = await Promise.all([
    prisma.membership.findMany({ where: { season, ...(status ? { status } : {}) }, orderBy: { memberNumber: "asc" }, include: { user: true, plan: true } }),
    prisma.membership.findMany({ distinct: ["season"], select: { season: true }, orderBy: { season: "desc" } }),
    prisma.membership.groupBy({ by: ["status"], where: { season }, _count: { _all: true } }),
  ]);
  const c = (s: string) => counts.find((x) => x.status === s)?._count._all ?? 0;
  const pendientesRenovar = await sociosPendientesDeRenovar(season);
  const sinAvisar = pendientesRenovar.filter((m) => !m.renewalReminderAt).length;

  return (
    <>
      <AdminHeader title="Socios" description="Recuento y gestión de cuotas por temporada." action={
        <div className="flex flex-wrap items-center gap-2">
          {seasons.map((s) => (
            <Link key={s.season} href={`/admin/socios?temporada=${s.season}`} className={`rounded-full px-4 py-2 text-sm font-bold ${s.season === season ? "bg-brand-600 text-white" : "bg-white text-ink-700"}`}>{s.season}</Link>
          ))}
          <ExportButton href={`/api/export/socios?temporada=${season}`}>Descargar para Excel</ExportButton>
        </div>
      } />

      {sp.avisos && (
        <div className="mb-6">
          <Alert tone="success">
            Avisos de renovación enviados: {sp.avisos} de {sp.total}. Puedes consultar el detalle en el registro de correos.
          </Alert>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href={`/admin/socios?temporada=${season}&estado=ACTIVE`}><Stat label="Activos" value={c("ACTIVE")} accent /></Link>
        <Link href={`/admin/socios?temporada=${season}&estado=PENDING`}><Stat label="Pendientes de pago" value={c("PENDING")} /></Link>
        <Link href={`/admin/socios?temporada=${season}`}><Stat label="Total temporada" value={memberships.length && !status ? memberships.length : c("ACTIVE") + c("PENDING") + c("EXPIRED") + c("CANCELLED")} /></Link>
      </div>
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold uppercase"><Send className="size-5 text-brand-600" /> Campaña de renovación</h2>
        <p className="mb-4 text-sm text-ink-600">
          Avisa por correo a los socios de la temporada {season} que todavía no han renovado para la {season + 1}. Cada socio renueva desde su
          área personal, eligiendo si mantiene o cambia de modalidad.
        </p>
        {!mailConfigurado() && (
          <div className="mb-4">
            <Alert>
              <MailWarning className="mr-1 inline size-4" /> No hay proveedor de correo configurado: los avisos se registrarán pero no saldrán.
              Añade <code>RESEND_API_KEY</code> o <code>SMTP_URL</code> en el archivo <code>.env</code> para enviarlos de verdad.
            </Alert>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Socios sin renovar" value={pendientesRenovar.length} sub={`de ${c("ACTIVE")} activos en ${season}`} accent />
          <Stat label="Sin avisar todavía" value={sinAvisar} />
          <Stat label="Ya avisados" value={pendientesRenovar.length - sinAvisar} />
        </div>
        <form action={enviarAvisosRenovacionAction} className="mt-5 flex flex-wrap items-center gap-4">
          <input type="hidden" name="temporada" value={season} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="soloSinAviso" defaultChecked className="size-5 accent-brand-600 sm:size-4" />
            Enviar solo a quien no haya recibido aviso todavía
          </label>
          <button className={smallBtn} disabled={pendientesRenovar.length === 0}>
            Enviar avisos de renovación
          </button>
        </form>
        {pendientesRenovar.length > 0 && (
          <p className="mt-3 text-xs text-ink-500">
            Se enviarán a: {pendientesRenovar.slice(0, 5).map((m) => m.user.name).join(", ")}
            {pendientesRenovar.length > 5 && ` y ${pendientesRenovar.length - 5} más`}.
          </p>
        )}
      </section>

      <Table className="mt-8">
        <thead><tr><th className={th}>Nº</th><th className={th}>Socio</th><th className={th}>Contacto</th><th className={th}>Modalidad</th><th className={th}>Cuota</th><th className={th}>Estado</th><th className={th}>Pago</th><th className={th}>Aviso</th><th className={th}></th></tr></thead>
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
              <td className={td}>{m.renewalReminderAt ? <span className="text-xs text-ink-500">{formatDate(m.renewalReminderAt)}</span> : "—"}</td>
              <td className={td}>
                {m.status === "PENDING" && (
                  <form action={markMembershipPaidAction}><input type="hidden" name="id" value={m.id} /><button className={smallBtn}>Marcar pagado</button></form>
                )}
              </td>
            </tr>
          ))}
          {memberships.length === 0 && <tr><td className={td} colSpan={9}><span className="text-ink-500">No hay socios con este filtro.</span></td></tr>}
        </tbody>
      </Table>
    </>
  );
}
