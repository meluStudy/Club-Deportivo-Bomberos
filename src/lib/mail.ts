import "server-only";
import { prisma } from "./prisma";
import { site } from "./site";

/**
 * Envío de correo con tres modos, según lo que haya configurado en el `.env`:
 *  1. RESEND_API_KEY  → se envía con Resend.
 *  2. SMTP_URL        → se envía por SMTP (el del propio dominio del club).
 *  3. Nada configurado → no se envía: se registra en la base de datos y se
 *     escribe en consola, para poder desarrollar y probar sin proveedor.
 * En los tres casos queda constancia en EmailLog.
 */

export type Correo = {
  to: string;
  subject: string;
  /** Cuerpo en texto plano; el HTML se genera con la plantilla del club. */
  text: string;
  template: string;
  /** Botón de acción opcional. */
  action?: { label: string; url: string };
  meta?: Record<string, unknown>;
};

const remitente = () => process.env.MAIL_FROM ?? `${site.name} <no-responder@clubdeportivobomberos.es>`;

export const mailConfigurado = () => Boolean(process.env.RESEND_API_KEY || process.env.SMTP_URL);

function plantilla({ subject, text, action }: Correo) {
  const parrafos = text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6;color:#2b2b32;font-size:15px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  const boton = action
    ? `<p style="margin:28px 0"><a href="${action.url}" style="display:inline-block;background:#e10600;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:700;font-family:Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase;font-size:14px">${action.label}</a></p>
       <p style="margin:0 0 16px;font-size:12px;color:#6a6a79">Si el botón no funciona, copia esta dirección en tu navegador:<br><span style="color:#e10600;word-break:break-all">${action.url}</span></p>`
    : "";
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f6f6f7;padding:24px;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e7ea">
      <tr><td style="background:#0b0b0d;padding:22px 28px">
        <span style="color:#fff;font-weight:700;font-size:18px;letter-spacing:1px;text-transform:uppercase">${site.name}</span>
      </td></tr>
      <tr><td style="padding:28px">
        <h1 style="margin:0 0 18px;font-size:22px;color:#0b0b0d">${subject}</h1>
        ${parrafos}${boton}
      </td></tr>
      <tr><td style="background:#f6f6f7;padding:18px 28px;font-size:12px;color:#6a6a79">
        ${site.legalName} · CIF ${site.cif}<br>
        <a href="${site.url}" style="color:#6a6a79">${site.url.replace(/^https?:\/\//, "")}</a>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export async function enviarCorreo(correo: Correo) {
  const html = plantilla(correo);
  let status = "REGISTRADO";
  let error: string | null = null;

  try {
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const res = await resend.emails.send({ from: remitente(), to: correo.to, subject: correo.subject, html, text: correo.text });
      if (res.error) throw new Error(res.error.message);
      status = "ENVIADO";
    } else if (process.env.SMTP_URL) {
      const nodemailer = await import("nodemailer");
      const transport = nodemailer.createTransport(process.env.SMTP_URL);
      await transport.sendMail({ from: remitente(), to: correo.to, subject: correo.subject, html, text: correo.text });
      status = "ENVIADO";
    } else if (process.env.NODE_ENV !== "production") {
      console.info(`\n📧 [sin proveedor de correo] Para: ${correo.to}\n   Asunto: ${correo.subject}${correo.action ? `\n   Enlace: ${correo.action.url}` : ""}\n`);
    }
  } catch (e) {
    status = "ERROR";
    error = e instanceof Error ? e.message : String(e);
    console.error("Error enviando correo:", error);
  }

  await prisma.emailLog.create({
    data: {
      to: correo.to,
      subject: correo.subject,
      template: correo.template,
      preview: `${correo.text.slice(0, 400)}${correo.action ? `\n\n${correo.action.label}: ${correo.action.url}` : ""}`,
      status,
      error,
      meta: correo.meta ? JSON.stringify(correo.meta) : null,
    },
  });

  return { status, error };
}
