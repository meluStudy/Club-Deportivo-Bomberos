import { prisma } from "@/lib/prisma";
import { AdminHeader, smallBtn } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { markMessageReadAction } from "@/actions/admin";

export default async function AdminMessages() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <>
      <AdminHeader title="Mensajes de contacto" description="Consultas recibidas desde el formulario web." />
      <ul className="space-y-4">
        {messages.map((m) => (
          <li key={m.id} className={`rounded-2xl bg-white p-6 shadow-card ${!m.read ? "border-l-4 border-brand-600" : ""}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">{m.subject} {!m.read && <Badge>Nuevo</Badge>}</h2>
                <p className="text-sm text-ink-500">{m.name} · <a href={`mailto:${m.email}`} className="underline">{m.email}</a> · {formatDateTime(m.createdAt)}</p>
              </div>
              {!m.read && <form action={markMessageReadAction}><input type="hidden" name="id" value={m.id} /><button className={smallBtn}>Marcar leído</button></form>}
            </div>
            <p className="mt-3 whitespace-pre-line text-ink-700">{m.message}</p>
          </li>
        ))}
        {messages.length === 0 && <p className="text-ink-500">No hay mensajes.</p>}
      </ul>
    </>
  );
}
