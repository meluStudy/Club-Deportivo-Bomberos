"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { enviarCorreo } from "@/lib/mail";
import { site } from "@/lib/site";
import { currentSeason, formatPrice } from "@/lib/utils";

/**
 * Socios de una temporada que todavía no han renovado para la siguiente.
 * Sirve para la campaña de renovación del panel.
 */
export async function sociosPendientesDeRenovar(temporadaOrigen: number) {
  const siguiente = temporadaOrigen + 1;
  const [activos, yaRenovados] = await Promise.all([
    prisma.membership.findMany({
      where: { season: temporadaOrigen, status: "ACTIVE" },
      include: { user: true, plan: true },
      orderBy: { memberNumber: "asc" },
    }),
    prisma.membership.findMany({ where: { season: siguiente, status: { in: ["ACTIVE", "PENDING"] } }, select: { userId: true } }),
  ]);
  const renovados = new Set(yaRenovados.map((m) => m.userId));
  return activos.filter((m) => !renovados.has(m.userId));
}

export async function enviarAvisosRenovacionAction(formData: FormData) {
  await requireAdmin();
  const temporadaOrigen = Number(formData.get("temporada")) || currentSeason();
  const soloSinAviso = formData.get("soloSinAviso") !== null;

  let pendientes = await sociosPendientesDeRenovar(temporadaOrigen);
  if (soloSinAviso) pendientes = pendientes.filter((m) => !m.renewalReminderAt);

  const siguiente = temporadaOrigen + 1;
  let enviados = 0;

  for (const m of pendientes) {
    const { status } = await enviarCorreo({
      to: m.user.email,
      subject: `Renueva tu cuota de socio ${siguiente}`,
      template: "renovacion-cuota",
      text: `Hola ${m.user.name.split(" ")[0]}:

Tu cuota de socio del ${site.name} corresponde a la temporada ${temporadaOrigen} y caduca el 31 de diciembre. Para seguir un año más solo tienes que renovar desde tu área de socio.

Tu número de socio es el ${m.memberNumber} y tu modalidad actual es "${m.plan.name}" (${formatPrice(m.plan.priceCents)} al año). Puedes mantenerla o cambiarla al renovar.

Renovar te da acceso a las diez secciones deportivas, al seguro deportivo y a los precios reducidos en la tienda y en los eventos del club.`,
      action: { label: `Renovar la temporada ${siguiente}`, url: `${site.url}/cuenta` },
      meta: { membershipId: m.id, userId: m.userId, temporada: siguiente },
    });
    if (status !== "ERROR") {
      await prisma.membership.update({ where: { id: m.id }, data: { renewalReminderAt: new Date() } });
      enviados++;
    }
  }

  revalidatePath("/admin/socios");
  redirect(`/admin/socios?temporada=${temporadaOrigen}&avisos=${enviados}&total=${pendientes.length}`);
}
