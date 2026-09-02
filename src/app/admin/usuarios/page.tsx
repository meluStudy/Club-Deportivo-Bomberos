import { prisma } from "@/lib/prisma";
import { AdminHeader, Table, th, td, smallInput, smallBtn } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { setUserRoleAction } from "@/actions/admin";
import { requireAdmin } from "@/lib/auth";

export default async function AdminUsers() {
  const me = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { memberships: true, registrations: true, orders: true } } } });
  return (
    <>
      <AdminHeader title="Usuarios" description="Cuentas registradas y sus permisos." />
      <Table>
        <thead><tr><th className={th}>Nombre</th><th className={th}>Correo</th><th className={th}>Alta</th><th className={th}>Actividad</th><th className={th}>Rol</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className={td}>{u.name} {u.isFirefighter && <Badge tone="soft">Bombero</Badge>}</td>
              <td className={td}>{u.email}</td>
              <td className={td}>{formatDate(u.createdAt)}</td>
              <td className={td}><span className="text-ink-500">{u._count.memberships} cuotas · {u._count.registrations} inscripciones · {u._count.orders} pedidos</span></td>
              <td className={td}>
                {u.id === me.id ? <Badge tone="dark">Administrador (tú)</Badge> : (
                  <form action={setUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="role" defaultValue={u.role} className={smallInput} aria-label="Rol">
                      <option value="PARTICIPANTE">Participante</option>
                      <option value="SOCIO">Socio</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                    <button className={smallBtn}>OK</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
