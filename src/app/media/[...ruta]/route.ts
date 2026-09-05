import { leerImagen, rutaSegura } from "@/lib/uploads";

/**
 * Sirve las imágenes subidas desde el panel, estén en disco o en la base de
 * datos. El nombre del archivo incluye el hash de su contenido, así que se
 * pueden cachear indefinidamente.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params;
  const relativa = rutaSegura(ruta.join("/"));
  if (!relativa) return new Response("Ruta no válida", { status: 400 });

  const imagen = await leerImagen(relativa);
  if (!imagen) return new Response("Imagen no encontrada", { status: 404 });

  return new Response(new Uint8Array(imagen.contenido), {
    headers: {
      "Content-Type": imagen.tipo,
      "Content-Length": String(imagen.contenido.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
