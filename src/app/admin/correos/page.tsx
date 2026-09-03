import { MailCheck, MailWarning, MailX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader, Table, th, td } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/form";
import { mailConfigurado } from "@/lib/mail";
import { formatDateTime } from "@/lib/utils";

const PLANTILLAS: Record<string, string> = {
  "reset-password": "Recuperar contraseña",
  "reset-password-ok": "Contraseña cambiada",
  "renovacion-cuota": "Aviso de renovación",
};

export default async function AdminCorreos() {
  await requireAdmin();
  const correos = await prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const configurado = mailConfigurado();

  return (
    <>
      <AdminHeader title="Correos enviados" description="Acuse de los avisos que salen de la web: recuperación de contraseña y campañas de renovación." />

      {!configurado && (
        <div className="mb-6">
          <Alert>
            <MailWarning className="mr-1 inline size-4" /> <strong>Sin proveedor de correo.</strong> Los mensajes se registran aquí pero no se
            envían. Añade <code>RESEND_API_KEY</code> (Resend) o <code>SMTP_URL</code> (el correo del dominio del club) en el archivo{" "}
            <code>.env</code> y vuelve a arrancar la web. Mientras tanto, los enlaces de recuperación aparecen en esta misma pantalla.
          </Alert>
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <th className={th}>Fecha</th><th className={th}>Destinatario</th><th className={th}>Asunto</th>
            <th className={th}>Tipo</th><th className={th}>Estado</th><th className={th}>Contenido</th>
          </tr>
        </thead>
        <tbody>
          {correos.map((c) => (
            <tr key={c.id}>
              <td className={td}>{formatDateTime(c.createdAt)}</td>
              <td className={td}>{c.to}</td>
              <td className={td}>{c.subject}</td>
              <td className={td}>{PLANTILLAS[c.template] ?? c.template}</td>
              <td className={td}>
                {c.status === "ENVIADO" ? (
                  <Badge tone="success"><MailCheck className="mr-1 inline size-3" /> Enviado</Badge>
                ) : c.status === "ERROR" ? (
                  <Badge tone="brand"><MailX className="mr-1 inline size-3" /> Error</Badge>
                ) : (
                  <Badge tone="warning">Solo registrado</Badge>
                )}
                {c.error && <span className="mt-1 block text-xs text-brand-600">{c.error}</span>}
              </td>
              <td className={td}>
                <details>
                  <summary className="cursor-pointer text-xs text-ink-500 hover:text-brand-600">Ver</summary>
                  <pre className="mt-2 max-w-md whitespace-pre-wrap break-words text-xs text-ink-600">{c.preview}</pre>
                </details>
              </td>
            </tr>
          ))}
          {correos.length === 0 && (
            <tr><td className={td} colSpan={6}><span className="text-ink-500">Todavía no se ha enviado ningún correo.</span></td></tr>
          )}
        </tbody>
      </Table>
    </>
  );
}
