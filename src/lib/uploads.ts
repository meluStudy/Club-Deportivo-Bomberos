import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { prisma } from "./prisma";

/**
 * Almacenamiento de las imágenes que se suben desde el panel. Dos modos:
 *
 *  - `disco` (por defecto): se guardan en la carpeta `UPLOADS_DIR`, fuera de
 *    `public/` para que sobrevivan a los despliegues. Es lo indicado en un VPS.
 *  - `base-datos`: se guardan en PostgreSQL. Más lento y ocupa base de datos,
 *    pero funciona en alojamientos sin disco persistente (Vercel, Netlify y
 *    similares), que es lo habitual en los planes gratuitos.
 *
 * Se elige con la variable MEDIA_STORAGE.
 */
export type Almacenamiento = "disco" | "base-datos";

export const almacenamiento = (): Almacenamiento =>
  process.env.MEDIA_STORAGE === "base-datos" ? "base-datos" : "disco";

export const carpetaSubidas = () => process.env.UPLOADS_DIR || join(process.cwd(), "uploads");

/** Dirección pública de un archivo subido. */
export const urlSubida = (relativa: string) => `/media/${relativa}`;

/** Rechaza rutas que intenten salir de la carpeta de subidas. */
export function rutaSegura(relativa: string) {
  const limpia = normalize(relativa).replace(/^(\.\.(\/|\\|$))+/, "");
  return limpia.includes("..") || limpia.startsWith("/") ? null : limpia;
}

export async function guardarImagen(relativa: string, contenido: Buffer, meta: { tipo: string; ancho: number; alto: number }) {
  if (almacenamiento() === "base-datos") {
    const bytes = new Uint8Array(contenido);
    const datos = { contenido: bytes, tipo: meta.tipo, ancho: meta.ancho, alto: meta.alto, bytes: bytes.length };
    await prisma.mediaFile.upsert({ where: { ruta: relativa }, update: datos, create: { ruta: relativa, ...datos } });
    return;
  }
  const destino = join(carpetaSubidas(), relativa);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, contenido);
}

export async function leerImagen(relativa: string): Promise<{ contenido: Buffer; tipo: string } | null> {
  if (almacenamiento() === "base-datos") {
    const fila = await prisma.mediaFile.findUnique({ where: { ruta: relativa } });
    return fila ? { contenido: Buffer.from(fila.contenido), tipo: fila.tipo } : null;
  }
  try {
    const contenido = await readFile(join(carpetaSubidas(), relativa));
    const ext = relativa.slice(relativa.lastIndexOf(".")).toLowerCase();
    const tipos: Record<string, string> = { ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".avif": "image/avif" };
    return tipos[ext] ? { contenido, tipo: tipos[ext] } : null;
  } catch {
    return null;
  }
}
