import { requireStaff, isAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const admin = isAdmin(staff);
  const links = [
    { href: "/admin", label: "Resumen", icon: "BarChart3", show: admin },
    { href: "/admin/socios", label: "Socios", icon: "Users", show: admin },
    { href: "/admin/tienda", label: "Tienda y stock", icon: "ShoppingBag", show: admin },
    { href: "/admin/pedidos", label: "Pedidos", icon: "Package", show: admin },
    { href: "/admin/eventos", label: "Eventos", icon: "CalendarDays", show: true },
    { href: "/admin/noticias", label: "Noticias", icon: "Newspaper", show: true },
    { href: "/admin/mensajes", label: "Mensajes", icon: "MessageSquare", show: admin },
    { href: "/admin/correos", label: "Correos", icon: "Mail", show: admin },
    { href: "/admin/usuarios", label: "Usuarios", icon: "UserCog", show: admin },
  ].filter((l) => l.show);
  return (
    <div className="flex flex-1 flex-col bg-ink-50 lg:flex-row">
      <AdminNav links={links} subtitle={admin ? "Administración general" : `Responsable · ${staff.managedSection?.name ?? "sección"}`} />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</div>
    </div>
  );
}
