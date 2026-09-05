import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireStaff } from "@/lib/auth";
import { consumirIntento, ipDelCliente } from "@/lib/rate-limit";
import { guardarImagen, urlSubida } from "@/lib/uploads";

const MAX_BYTES = 12 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/**
 * Subida de imágenes desde el panel. La imagen se redimensiona y se convierte
 * a WebP para que la web cargue rápido, y se guarda donde indique
 * MEDIA_STORAGE: en disco (VPS) o en la base de datos (alojamientos sin disco
 * persistente). Se sirven por la ruta /media.
 */
export async function POST(req: Request) {
  const staff = await requireStaff();
  const ip = await ipDelCliente();
  const limite = await consumirIntento(`subida:${staff.id}:${ip}`, 60, 60, 15);
  if (!limite.permitido) return NextResponse.json({ error: "Demasiadas subidas seguidas. Espera unos minutos." }, { status: 429 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No se ha recibido ninguna imagen." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "La imagen supera los 12 MB." }, { status: 400 });
  if (!TIPOS.includes(file.type)) return NextResponse.json({ error: "Formato no admitido. Usa JPG, PNG, WebP o AVIF." }, { status: 400 });

  const original = Buffer.from(await file.arrayBuffer());
  let procesada: Buffer;
  let ancho = 0;
  let alto = 0;
  try {
    const img = sharp(original, { animated: false }).rotate(); // respeta la orientación de la cámara
    const meta = await img.metadata();
    if (!meta.width || !meta.height) throw new Error("sin dimensiones");
    const salida = await img
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    procesada = salida.data;
    ancho = salida.info.width;
    alto = salida.info.height;
  } catch {
    return NextResponse.json({ error: "No se ha podido leer la imagen." }, { status: 400 });
  }

  const ahora = new Date();
  const carpeta = `${ahora.getFullYear()}/${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  const nombre = `${createHash("sha1").update(procesada).digest("hex").slice(0, 16)}.webp`;
  const relativa = `${carpeta}/${nombre}`;
  await guardarImagen(relativa, procesada, { tipo: "image/webp", ancho, alto });

  return NextResponse.json({ url: urlSubida(relativa), width: ancho, height: alto, size: procesada.length });
}
