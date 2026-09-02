/**
 * Pictogramas deportivos dibujados a mano en un lienzo de 0 a 100.
 * Se usan para generar las ilustraciones de la web (ver generar-imagenes.mjs).
 */
export type Trazo =
  | { type: "stroke"; d: string; w: number }
  | { type: "fill"; d: string }
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "circleStroke"; cx: number; cy: number; r: number; w: number }
  | { type: "ellipseStroke"; cx: number; cy: number; rx: number; ry: number; rot: number; w: number };

const S = (d: string, w = 7): Trazo => ({ type: "stroke", d, w });
const F = (d: string): Trazo => ({ type: "fill", d });
const C = (cx: number, cy: number, r: number): Trazo => ({ type: "circle", cx, cy, r });

export const pictogramas: Record<string, Trazo[]> = {
  atletismo: [
    C(60, 17, 8.5),
    S("M54 30 L44 48"), S("M55 33 L72 41"), S("M51 28 L33 21"),
    S("M44 48 L56 71"), S("M44 48 L25 55"),
  ],
  futbol: [
    { type: "circleStroke", cx: 50, cy: 50, r: 30, w: 6 },
    F("M50 32 L64 42 L58.5 58 L41.5 58 L36 42 Z"),
    S("M50 32 L50 20", 5), S("M64 42 L76 38", 5), S("M58.5 58 L64 70", 5),
    S("M41.5 58 L36 70", 5), S("M36 42 L24 38", 5),
  ],
  rugby: [
    { type: "ellipseStroke", cx: 50, cy: 50, rx: 32, ry: 19, rot: -28, w: 6 },
    S("M34 62 L66 38", 5), S("M40 55 L47 62", 5), S("M47 48 L54 55", 5), S("M54 41 L61 48", 5),
  ],
  ciclismo: [
    { type: "circleStroke", cx: 22, cy: 64, r: 17, w: 5.5 },
    { type: "circleStroke", cx: 78, cy: 64, r: 17, w: 5.5 },
    S("M22 64 L44 64 L58 38 L44 38", 5.5), S("M44 64 L64 40 L78 64", 5.5),
    S("M58 38 L70 38", 5), C(50, 64, 4),
  ],
  natacion: [
    C(62, 30, 7),
    S("M30 44 Q46 30 58 38 Q68 44 78 36"),
    S("M14 62 Q26 54 38 62 Q50 70 62 62 Q74 54 86 62", 5.5),
    S("M14 78 Q26 70 38 78 Q50 86 62 78 Q74 70 86 78", 5.5),
  ],
  triatlon: [
    { type: "circleStroke", cx: 50, cy: 56, r: 27, w: 6 },
    S("M50 56 L50 38", 5.5), S("M50 56 L64 62", 5.5),
    S("M40 20 L60 20", 6), S("M50 20 L50 29", 6),
  ],
  montana: [
    S("M8 78 L34 34 L52 60 L64 44 L92 78 Z", 6),
    S("M64 44 L64 16", 5), S("M64 16 L82 22 L64 28", 5),
  ],
  padel: [
    { type: "ellipseStroke", cx: 50, cy: 40, rx: 24, ry: 28, rot: 0, w: 6 },
    S("M50 68 L50 88", 7),
    C(41, 32, 3), C(59, 32, 3), C(41, 48, 3), C(59, 48, 3), C(50, 40, 3),
  ],
  baloncesto: [
    { type: "circleStroke", cx: 50, cy: 50, r: 30, w: 6 },
    S("M20 50 L80 50", 5), S("M50 20 L50 80", 5),
    S("M28 28 Q50 50 28 72", 5), S("M72 28 Q50 50 72 72", 5),
  ],
  crossfit: [
    S("M22 50 L78 50", 9),
    S("M18 38 L18 62", 11), S("M82 38 L82 62", 11),
    S("M8 44 L8 56", 8), S("M92 44 L92 56", 8),
  ],
  club: [
    C(60, 17, 8.5), S("M54 30 L44 48"), S("M55 33 L72 41"), S("M51 28 L33 21"),
    S("M44 48 L56 71"), S("M44 48 L25 55"),
  ],
};

export const prendas: Record<string, Trazo[]> = {
  camiseta: [S("M30 26 L18 34 L26 48 L32 44 L32 82 L68 82 L68 44 L74 48 L82 34 L70 26 L60 22 Q50 30 40 22 Z", 5)],
  sudadera: [S("M30 30 L18 38 L26 52 L32 48 L32 84 L68 84 L68 48 L74 52 L82 38 L70 30 L62 26 Q50 38 38 26 Z", 5), S("M40 26 Q50 42 60 26", 4), S("M50 42 L50 58", 4)],
  chaqueta: [S("M30 26 L18 34 L26 48 L32 44 L32 84 L68 84 L68 44 L74 48 L82 34 L70 26 L58 22 L50 30 L42 22 Z", 5), S("M50 30 L50 84", 4), S("M40 44 L34 44", 3.5), S("M60 44 L66 44", 3.5)],
  gorra: [S("M22 58 Q22 28 50 28 Q78 28 78 58 Z", 5), S("M22 58 L92 58 Q92 66 78 66 L22 66 Z", 5)],
  maillot: [S("M30 26 L18 34 L26 48 L32 44 L32 82 L68 82 L68 44 L74 48 L82 34 L70 26 L60 22 Q50 30 40 22 Z", 5), S("M42 30 L42 82", 3.5), S("M58 30 L58 82", 3.5), S("M36 72 L64 72", 3.5)],
  bolsa: [S("M14 42 L86 42 Q92 42 92 50 L92 74 Q92 82 84 82 L16 82 Q8 82 8 74 L8 50 Q8 42 14 42 Z", 5), S("M36 42 L36 30 Q36 24 42 24 L58 24 Q64 24 64 30 L64 42", 5), S("M8 60 L92 60", 3.5)],
  botella: [S("M38 30 L38 20 L62 20 L62 30 Q72 36 72 48 L72 82 Q72 88 66 88 L34 88 Q28 88 28 82 L28 48 Q28 36 38 30 Z", 5), S("M28 52 L72 52", 4), S("M42 14 L58 14 L58 20 L42 20 Z", 4)],
};

/** Convierte una lista de trazos en SVG, con el color y la escala indicados. */
export function dibujar(items: Trazo[], { color = "#fff", opacity = 1, scale = 1, x = 0, y = 0 } = {}) {
  const parts = items.map((it) => {
    if (it.type === "stroke") return `<path d="${it.d}" fill="none" stroke="${color}" stroke-width="${it.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (it.type === "fill") return `<path d="${it.d}" fill="${color}"/>`;
    if (it.type === "circle") return `<circle cx="${it.cx}" cy="${it.cy}" r="${it.r}" fill="${color}"/>`;
    if (it.type === "circleStroke") return `<circle cx="${it.cx}" cy="${it.cy}" r="${it.r}" fill="none" stroke="${color}" stroke-width="${it.w}"/>`;
    if (it.type === "ellipseStroke")
      return `<ellipse cx="${it.cx}" cy="${it.cy}" rx="${it.rx}" ry="${it.ry}" fill="none" stroke="${color}" stroke-width="${it.w}" transform="rotate(${it.rot} ${it.cx} ${it.cy})"/>`;
    return "";
  });
  return `<g opacity="${opacity}" transform="translate(${x} ${y}) scale(${scale})">${parts.join("")}</g>`;
}
