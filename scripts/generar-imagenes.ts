/**
 * Genera las ilustraciones de la web (secciones, noticias, eventos, productos
 * y portada) con la identidad del club. Son provisionales: en cuanto haya
 * fotografías reales basta con sustituir los archivos por las fotos.
 *
 *   npm run imagenes
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dibujar, pictogramas, prendas } from "../src/lib/pictogramas";

const RED = "#e10600", INK = "#0b0b0d";

// Cada sección con su pictograma, su ángulo de banda y su color de apoyo
const SECCIONES: Record<string, { pic: string; tono: string; giro: number }> = {
  atletismo: { pic: "atletismo", tono: "#7a0d0a", giro: -12 },
  futbol: { pic: "futbol", tono: "#123", giro: 8 },
  rugby: { pic: "rugby", tono: "#5d0c0a", giro: -6 },
  ciclismo: { pic: "ciclismo", tono: "#1a1a4a", giro: 10 },
  natacion: { pic: "natacion", tono: "#0d1b4a", giro: -8 },
  triatlon: { pic: "triatlon", tono: "#3a0a0a", giro: 12 },
  montana: { pic: "montana", tono: "#14203a", giro: -10 },
  padel: { pic: "padel", tono: "#4a0c0a", giro: 6 },
  baloncesto: { pic: "baloncesto", tono: "#3d1a06", giro: -14 },
  crossfit: { pic: "crossfit", tono: "#25252e", giro: 9 },
};

const tramas = `
<pattern id="rayas" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <rect width="4" height="26" fill="rgba(255,255,255,0.05)"/>
</pattern>
<pattern id="puntos" width="18" height="18" patternUnits="userSpaceOnUse">
  <circle cx="3" cy="3" r="2.1" fill="rgba(255,255,255,0.09)"/>
</pattern>`;

/** Lienzo oscuro con banda roja diagonal, trama y pictograma del deporte. */
type Oscuro = { w: number; h: number; pic: string; tono: string; giro: number; semilla?: number };
function lienzoOscuro({ w, h, pic, tono, giro, semilla = 0 }: Oscuro) {
  const bandaY = h * (0.56 + (semilla % 3) * 0.05);
  const bandaAlto = h * 0.1;

  // Pictograma grande: ocupa el 72 % del lado menor y se centra un poco alto
  const grande = (Math.min(w, h) * 0.72) / 100;
  const gx = (w - 100 * grande) / 2 + w * 0.04;
  const gy = h * 0.34 - 50 * grande;

  // Pictograma pequeño de cabecera, en la esquina superior izquierda
  const chico = (Math.min(w, h) * 0.15) / 100;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
  <linearGradient id="fondo" x1="0.1" y1="0" x2="0.7" y2="1">
    <stop offset="0" stop-color="${tono}"/><stop offset="0.5" stop-color="#16161b"/><stop offset="1" stop-color="${INK}"/>
  </linearGradient>
  <linearGradient id="banda" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${RED}"/><stop offset="1" stop-color="#8c0f0b"/>
  </linearGradient>
  <radialGradient id="halo"><stop offset="0" stop-color="${RED}" stop-opacity="0.42"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></radialGradient>
  <linearGradient id="sombra" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${INK}" stop-opacity="0"/><stop offset="1" stop-color="${INK}" stop-opacity="0.92"/>
  </linearGradient>
  ${tramas}
</defs>
<rect width="${w}" height="${h}" fill="url(#fondo)"/>
<circle cx="${w * 0.82}" cy="${h * 0.14}" r="${Math.max(w, h) * 0.4}" fill="url(#halo)"/>
<rect width="${w}" height="${h}" fill="url(#puntos)"/>
${dibujar(pictogramas[pic], { color: "#ffffff", opacity: 0.16, scale: grande, x: gx, y: gy })}
<g transform="rotate(${giro} ${w / 2} ${bandaY})">
  <rect x="${-w * 0.25}" y="${bandaY}" width="${w * 1.5}" height="${bandaAlto}" fill="url(#banda)" opacity="0.9"/>
  <rect x="${-w * 0.25}" y="${bandaY + bandaAlto * 1.35}" width="${w * 1.5}" height="${bandaAlto * 0.18}" fill="${RED}" opacity="0.7"/>
</g>
<rect width="${w}" height="${h}" fill="url(#rayas)"/>
${dibujar(pictogramas[pic], { color: "#ffffff", opacity: 0.9, scale: chico, x: w * 0.06, y: h * 0.06 })}
<rect x="0" y="${h * 0.55}" width="${w}" height="${h * 0.45}" fill="url(#sombra)"/>
</svg>`;
}

/** Lienzo claro tipo estudio para las fotos de producto. */
function lienzoProducto({ w, h, prenda, semilla = 0 }: { w: number; h: number; prenda: string; semilla?: number }) {
  const acento = semilla % 2 ? RED : INK;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
  <linearGradient id="f" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#f7f7f8"/><stop offset="1" stop-color="#e6e6ea"/></linearGradient>
  <pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.6" fill="rgba(11,11,13,0.05)"/></pattern>
</defs>
<rect width="${w}" height="${h}" fill="url(#f)"/>
<rect width="${w}" height="${h}" fill="url(#p)"/>
<circle cx="${w * 0.5}" cy="${h * 0.52}" r="${w * 0.33}" fill="#ffffff" opacity="0.85"/>
<circle cx="${w * 0.5}" cy="${h * 0.52}" r="${w * 0.33}" fill="none" stroke="${acento}" stroke-width="${w * 0.006}" opacity="0.22"/>
${dibujar(prendas[prenda], { color: acento, opacity: 0.92, scale: w * 0.0062, x: w * 0.19, y: h * 0.2 })}
<rect x="0" y="${h - w * 0.02}" width="${w}" height="${w * 0.02}" fill="${RED}"/>
</svg>`;
}

const salida = (ruta: string, contenido: string) => {
  mkdirSync(ruta.split("/").slice(0, -1).join("/"), { recursive: true });
  writeFileSync(ruta, contenido);
};

// ── Secciones (vertical 3:4) ──
Object.entries(SECCIONES).forEach(([slug, cfg], i) =>
  salida(`public/images/sections/${slug}.svg`, lienzoOscuro({ w: 900, h: 1200, ...cfg, semilla: i })),
);

// ── Portada ──
salida("public/images/hero.svg", lienzoOscuro({ w: 1920, h: 1080, pic: "club", tono: "#5d0c0a", giro: -7, semilla: 1 }));

// ── Noticias y eventos (16:10) ──
const NOTICIAS: Record<string, string> = {
  "campeonato-espana-bomberos-atletismo": "atletismo",
  "torneo-rugby-bomberos-madrid-2026": "rugby",
  "nueva-equipacion-oficial-2026": "club",
  "asamblea-general-ordinaria": "club",
  "ciclismo-quebrantahuesos": "ciclismo",
  "escuela-natacion-aguas-abiertas": "natacion",
  "torneo-benefico-futbol-fundacion": "futbol",
  "firefighter-challenge-madrid": "crossfit",
};
Object.entries(NOTICIAS).forEach(([slug, pic], i) => {
  const cfg = Object.values(SECCIONES)[i % 10];
  salida(`public/images/news/${slug}.svg`, lienzoOscuro({ w: 1200, h: 750, pic, tono: cfg.tono, giro: cfg.giro, semilla: i }));
});

const EVENTOS: Record<string, string> = {
  "torneo-rugby-bomberos-madrid": "rugby",
  "carrera-popular-bomberos-madrid": "atletismo",
  "travesia-sierra-guadarrama": "montana",
  "marcha-ciclista-bomberos": "ciclismo",
  "torneo-padel-familias": "padel",
  "gala-anual-club": "club",
};
Object.entries(EVENTOS).forEach(([slug, pic], i) => {
  const cfg = SECCIONES[pic] ?? SECCIONES.atletismo;
  salida(`public/images/events/${slug}.svg`, lienzoOscuro({ w: 1600, h: 1000, pic, tono: cfg.tono, giro: cfg.giro, semilla: i + 2 }));
});

// ── Productos (cuadrado, fondo claro) ──
const PRODUCTOS: Record<string, string> = {
  "camiseta-oficial-2026": "camiseta",
  "sudadera-capucha-club": "sudadera",
  "chaqueta-tecnica-entrenamiento": "chaqueta",
  "gorra-club": "gorra",
  "maillot-ciclismo": "maillot",
  "bolsa-deporte": "bolsa",
  "camiseta-rugby": "camiseta",
  "botella-termica": "botella",
};
Object.entries(PRODUCTOS).forEach(([slug, prenda], i) =>
  salida(`public/images/products/${slug}.svg`, lienzoProducto({ w: 900, h: 900, prenda, semilla: i })),
);

console.log("Ilustraciones generadas: secciones, portada, noticias, eventos y productos.");
