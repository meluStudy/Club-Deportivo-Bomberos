import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, normalize, extname } from "node:path";
import { Readable } from "node:stream";
import { carpetaSubidas } from "@/lib/uploads";

const TIPOS: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

/**
 * Sirve las imágenes subidas desde el panel. Se guardan fuera de la carpeta
 * pública para que sobrevivan a los despliegues y se puedan poner en un disco
 * aparte (variable UPLOADS_DIR).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params;
  const relativa = normalize(ruta.join("/"));
  if (relativa.includes("..") || relativa.startsWith("/")) return new Response("Ruta no válida", { status: 400 });

  const tipo = TIPOS[extname(relativa).toLowerCase()];
  if (!tipo) return new Response("Formato no admitido", { status: 404 });

  const archivo = join(carpetaSubidas(), relativa);
  try {
    const info = await stat(archivo);
    if (!info.isFile()) throw new Error("no es un archivo");
    return new Response(Readable.toWeb(createReadStream(archivo)) as ReadableStream, {
      headers: {
        "Content-Type": tipo,
        "Content-Length": String(info.size),
        // El nombre incluye el hash del contenido: se puede cachear para siempre
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Imagen no encontrada", { status: 404 });
  }
}
