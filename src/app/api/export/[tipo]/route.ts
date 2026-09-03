import { prisma } from "@/lib/prisma";
import { canManageSection, isAdmin, requireStaff } from "@/lib/auth";
import { euros, fechaCsv, fechaHoraCsv, generarCsv, respuestaCsv } from "@/lib/csv";
import { CAMPOS_PARTICIPANTE, type CampoParticipante } from "@/lib/validators";
import { parseJson } from "@/lib/utils";

const ESTADO_INSCRIPCION = { CONFIRMED: "Confirmada", PENDING: "Pendiente de pago", CANCELLED: "Cancelada" } as const;
const ESTADO_PEDIDO = { PENDING: "Pendiente", PAID: "Pagado", SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado" } as const;
const ESTADO_CUOTA = { ACTIVE: "Pagada", PENDING: "Pendiente", EXPIRED: "Caducada", CANCELLED: "Cancelada" } as const;
const ROL = { ADMIN: "Administrador", SOCIO: "Socio", PARTICIPANTE: "Participante" } as const;

/**
 * Descarga de listados en CSV para abrir en Excel.
 *   /api/export/inscritos?evento=<id>
 *   /api/export/socios?temporada=2026
 *   /api/export/pedidos
 *   /api/export/usuarios
 */
export async function GET(req: Request, { params }: { params: Promise<{ tipo: string }> }) {
  const staff = await requireStaff();
  const { tipo } = await params;
  const url = new URL(req.url);

  if (tipo === "inscritos") {
    const eventId = url.searchParams.get("evento");
    if (!eventId) return new Response("Falta el evento", { status: 400 });
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: { include: { user: true, ticket: true }, orderBy: { createdAt: "asc" } } },
    });
    if (!event) return new Response("Evento no encontrado", { status: 404 });
    if (!canManageSection(staff, event.sectionId)) return new Response("Sin permiso", { status: 403 });

    const pedidos = parseJson<CampoParticipante[]>(event.requiredFields, []);
    const cabeceras = [
      "Nº", "Nombre", "Correo", "Teléfono", "Modalidad", "Importe (€)", "Estado", "Fecha de inscripción", "Fecha de pago", "Socio",
      ...pedidos.map((c) => CAMPOS_PARTICIPANTE[c].label),
      "Observaciones",
    ];
    const filas = event.registrations.map((r, i) => [
      i + 1,
      r.user.name,
      r.user.email,
      r.user.phone ?? "",
      r.ticketName ?? r.ticket?.name ?? "",
      euros(r.amountCents),
      ESTADO_INSCRIPCION[r.status],
      fechaHoraCsv(r.createdAt),
      fechaHoraCsv(r.paidAt),
      r.user.role === "SOCIO" || r.user.role === "ADMIN" ? "Sí" : "No",
      ...pedidos.map((c) => {
        const v = r[c as keyof typeof r];
        return c === "birthDate" ? fechaCsv(v as Date | null) : ((v as string) ?? "");
      }),
      r.notes ?? "",
    ]);
    return respuestaCsv(`inscritos-${event.slug}`, generarCsv(cabeceras, filas));
  }

  if (!isAdmin(staff)) return new Response("Sin permiso", { status: 403 });

  if (tipo === "socios") {
    const temporada = Number(url.searchParams.get("temporada")) || new Date().getFullYear();
    const filasBd = await prisma.membership.findMany({
      where: { season: temporada },
      include: { user: true, plan: true },
      orderBy: { memberNumber: "asc" },
    });
    const cabeceras = ["Nº socio", "Nombre", "Correo", "Teléfono", "DNI", "Fecha de nacimiento", "Bombero", "Modalidad", "Cuota (€)", "Estado", "Fecha de pago", "Alta", "Caduca"];
    const filas = filasBd.map((m) => [
      m.memberNumber, m.user.name, m.user.email, m.user.phone ?? "", m.user.dni ?? "", fechaCsv(m.user.birthDate),
      m.user.isFirefighter ? "Sí" : "No", m.plan.name, euros(m.amountCents), ESTADO_CUOTA[m.status], fechaCsv(m.paidAt), fechaCsv(m.startsAt), fechaCsv(m.expiresAt),
    ]);
    return respuestaCsv(`socios-${temporada}`, generarCsv(cabeceras, filas));
  }

  if (tipo === "pedidos") {
    const pedidos = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
    const cabeceras = ["Referencia", "Fecha", "Cliente", "Correo", "Teléfono", "Artículos", "Entrega", "Dirección", "Total (€)", "Estado"];
    const filas = pedidos.map((o) => {
      const dir = o.address ? (JSON.parse(o.address) as { address: string; city: string; postalCode: string }) : null;
      return [
        o.id.slice(-8).toUpperCase(), fechaHoraCsv(o.createdAt), o.fullName, o.email, o.phone ?? "",
        o.items.map((i) => `${i.quantity}× ${i.productName} (${i.variantLabel})`).join(" | "),
        o.shippingMethod === "envio" ? "Envío" : "Recogida",
        dir ? `${dir.address}, ${dir.postalCode} ${dir.city}` : "",
        euros(o.totalCents), ESTADO_PEDIDO[o.status],
      ];
    });
    return respuestaCsv("pedidos", generarCsv(cabeceras, filas));
  }

  if (tipo === "usuarios") {
    const usuarios = await prisma.user.findMany({
      include: { managedSection: true, _count: { select: { memberships: true, registrations: true, orders: true } } },
      orderBy: { createdAt: "desc" },
    });
    const cabeceras = ["Nombre", "Correo", "Teléfono", "Rol", "Sección que gestiona", "Bombero", "Alta", "Cuotas", "Inscripciones", "Pedidos"];
    const filas = usuarios.map((u) => [
      u.name, u.email, u.phone ?? "", ROL[u.role], u.managedSection?.name ?? "", u.isFirefighter ? "Sí" : "No",
      fechaCsv(u.createdAt), u._count.memberships, u._count.registrations, u._count.orders,
    ]);
    return respuestaCsv("usuarios", generarCsv(cabeceras, filas));
  }

  return new Response("Listado no reconocido", { status: 404 });
}
