import { join } from "node:path";

/**
 * Carpeta donde se guardan las imágenes que se suben desde el panel.
 * Por defecto `uploads/` en la raíz del proyecto, fuera de `public/`, para que
 * no se pierdan al desplegar. En producción conviene apuntar UPLOADS_DIR a un
 * disco persistente (por ejemplo /var/www/cdb/uploads).
 */
export const carpetaSubidas = () => process.env.UPLOADS_DIR ?? join(process.cwd(), "uploads");

/** Dirección pública de un archivo subido. */
export const urlSubida = (relativa: string) => `/media/${relativa}`;
