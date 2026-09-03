/**
 * Generación de CSV pensada para abrirse bien en Excel en español:
 * separador de punto y coma, salto de línea de Windows y marca BOM para
 * que respete las tildes.
 */
export function generarCsv(cabeceras: string[], filas: (string | number | null | undefined)[][]) {
  const escapar = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[";\n\r]/.test(s) ? `"${s}"` : s;
  };
  const lineas = [cabeceras.map(escapar).join(";"), ...filas.map((f) => f.map(escapar).join(";"))];
  return `﻿${lineas.join("\r\n")}\r\n`;
}

export function respuestaCsv(nombre: string, contenido: string) {
  const fecha = new Date().toISOString().slice(0, 10);
  const limpio = nombre.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  return new Response(contenido, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${limpio}-${fecha}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Fecha en formato español, para que Excel no la interprete al revés. */
export const fechaCsv = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d)) : "";

export const fechaHoraCsv = (d: Date | null | undefined) =>
  d
    ? new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d))
    : "";

/** Importe con coma decimal, como espera Excel en español. */
export const euros = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
