import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader, Table, th, td, smallInput, smallBtn } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/admin/export-button";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { updateOrderStatusAction } from "@/actions/admin";

const labels: Record<string, string> = { PENDING: "Pendiente", PAID: "Pagado", SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado" };

export default async function AdminOrders() {
  await requireAdmin();
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true }, take: 200 });
  return (
    <>
      <AdminHeader title="Pedidos" description="Pedidos de la tienda oficial. Actualiza el estado a medida que preparas y entregas." action={<ExportButton href="/api/export/pedidos">Descargar para Excel</ExportButton>} />
      <Table>
        <thead><tr><th className={th}>Ref.</th><th className={th}>Fecha</th><th className={th}>Cliente</th><th className={th}>Artículos</th><th className={th}>Entrega</th><th className={th}>Total</th><th className={th}>Estado</th></tr></thead>
        <tbody>
          {orders.map((o) => {
            const addr = o.address ? (JSON.parse(o.address) as { address: string; city: string; postalCode: string }) : null;
            return (
              <tr key={o.id}>
                <td className={td}><code className="text-xs">{o.id.slice(-8).toUpperCase()}</code></td>
                <td className={td}>{formatDateTime(o.createdAt)}</td>
                <td className={td}>{o.fullName}<br /><span className="text-ink-500">{o.email}{o.phone ? ` · ${o.phone}` : ""}</span></td>
                <td className={td}><ul>{o.items.map((i) => <li key={i.id}>{i.quantity}× {i.productName} <span className="text-ink-500">({i.variantLabel})</span></li>)}</ul></td>
                <td className={td}>{o.shippingMethod === "envio" ? <>Envío<br /><span className="text-ink-500">{addr ? `${addr.address}, ${addr.postalCode} ${addr.city}` : ""}</span></> : "Recogida en club"}</td>
                <td className={td}><strong>{formatPrice(o.totalCents)}</strong></td>
                <td className={td}>
                  <form action={updateOrderStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <select name="status" defaultValue={o.status} className={smallInput} aria-label="Estado">
                      {Object.entries(labels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <button className={smallBtn}>OK</button>
                  </form>
                  <Badge tone={o.status === "PAID" ? "warning" : o.status === "CANCELLED" || o.status === "PENDING" ? "neutral" : "success"} className="mt-1">{labels[o.status]}</Badge>
                </td>
              </tr>
            );
          })}
          {orders.length === 0 && <tr><td className={td} colSpan={7}><span className="text-ink-500">Todavía no hay pedidos.</span></td></tr>}
        </tbody>
      </Table>
    </>
  );
}
