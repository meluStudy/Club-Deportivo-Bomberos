import Link from "next/link";
import { BarChart3, CalendarDays, MessageSquare, Newspaper, Package, ShoppingBag, Users, UserCog } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export const adminLinks = [
  { href: "/admin", label: "Resumen", icon: "BarChart3" },
  { href: "/admin/socios", label: "Socios", icon: "Users" },
  { href: "/admin/tienda", label: "Tienda y stock", icon: "ShoppingBag" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "Package" },
  { href: "/admin/eventos", label: "Eventos", icon: "CalendarDays" },
  { href: "/admin/noticias", label: "Noticias", icon: "Newspaper" },
  { href: "/admin/mensajes", label: "Mensajes", icon: "MessageSquare" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "UserCog" },
];
void BarChart3; void Users; void ShoppingBag; void Package; void CalendarDays; void Newspaper; void MessageSquare; void UserCog; void Link;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex flex-1 flex-col bg-ink-50 lg:flex-row">
      <AdminNav links={adminLinks} />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</div>
    </div>
  );
}
