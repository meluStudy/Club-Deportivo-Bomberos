import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Comprobación de estado para el panel de despliegue: responde 200 si la web
 * está en pie y la base de datos tiene las tablas, y 503 si no. Coolify la
 * consulta para saber si un despliegue ha salido bien.
 */
export async function GET() {
  const inicio = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    return fallo("sin conexión", e);
  }
  try {
    await prisma.section.count();
    return NextResponse.json(
      { estado: "ok", baseDatos: "conectada", ms: Date.now() - inicio },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    // Conecta pero faltan las tablas: no se han aplicado las migraciones
    return fallo("sin tablas", e);
  }
}

function fallo(baseDatos: string, e: unknown) {
  return NextResponse.json(
    // El detalle solo en desarrollo: esta ruta es pública
    { estado: "error", baseDatos, ...(process.env.NODE_ENV !== "production" && { detalle: e instanceof Error ? e.message : String(e) }) },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
