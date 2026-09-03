import "server-only";
import { headers } from "next/headers";
import { prisma } from "./prisma";

/**
 * Límite de intentos guardado en la base de datos, para que funcione igual
 * con uno o con varios servidores. Al superar el máximo se bloquea la clave
 * durante un tiempo que crece con cada bloqueo.
 */

export type Limite = { permitido: boolean; restantes: number; bloqueadoHasta?: Date };

export async function ipDelCliente() {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? h.get("x-real-ip") ?? "desconocida").trim();
}

/** Comprueba y consume un intento. `ventanaMin` reinicia el contador. */
export async function consumirIntento(clave: string, maximo: number, ventanaMin: number, bloqueoMin = 15): Promise<Limite> {
  const ahora = new Date();
  const registro = await prisma.rateLimit.findUnique({ where: { key: clave } });

  if (registro?.blockedUntil && registro.blockedUntil > ahora) {
    return { permitido: false, restantes: 0, bloqueadoHasta: registro.blockedUntil };
  }

  const ventanaExpirada = !registro || ahora.getTime() - registro.firstAttempt.getTime() > ventanaMin * 60_000;
  const count = ventanaExpirada ? 1 : registro.count + 1;

  if (count > maximo) {
    // Cada bloqueo consecutivo dura más: 15, 30, 60… minutos
    const veces = Math.floor(count / maximo);
    const minutos = Math.min(bloqueoMin * 2 ** (veces - 1), 240);
    const blockedUntil = new Date(ahora.getTime() + minutos * 60_000);
    await prisma.rateLimit.upsert({
      where: { key: clave },
      update: { count, blockedUntil },
      create: { key: clave, count, blockedUntil, firstAttempt: ahora },
    });
    return { permitido: false, restantes: 0, bloqueadoHasta: blockedUntil };
  }

  await prisma.rateLimit.upsert({
    where: { key: clave },
    update: ventanaExpirada ? { count: 1, firstAttempt: ahora, blockedUntil: null } : { count },
    create: { key: clave, count: 1, firstAttempt: ahora },
  });
  return { permitido: true, restantes: maximo - count };
}

/** Borra el contador tras una acción correcta (por ejemplo, un acceso válido). */
export async function limpiarIntentos(clave: string) {
  await prisma.rateLimit.deleteMany({ where: { key: clave } });
}

export function minutosRestantes(hasta: Date) {
  return Math.max(1, Math.ceil((hasta.getTime() - Date.now()) / 60_000));
}
