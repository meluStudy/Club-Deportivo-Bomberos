/**
 * Utilidades de la microweb de eventos: pestañas, parsers de los textos
 * estructurados que rellena el administrador y análisis de archivos GPX.
 */

export const EVENT_TABS = [
  { key: "inicio", label: "Inicio", path: "" },
  { key: "presentacion", label: "Presentación", path: "presentacion" },
  { key: "alojamiento", label: "Alojamiento", path: "alojamiento" },
  { key: "programa", label: "Programa", path: "programa" },
  { key: "etapas", label: "Etapas", path: "etapas" },
  { key: "inscripciones", label: "Inscripciones", path: "inscripciones" },
  { key: "contacto", label: "Contacto", path: "contacto" },
] as const;

export type EventTabKey = (typeof EVENT_TABS)[number]["key"];

type EventLike = {
  presentation: string | null;
  accommodation: string | null;
  accommodations: string | null;
  program: string | null;
  customHtml: string | null;
  stages?: { id: string }[];
};

/** Pestañas visibles: Inicio, Inscripciones y Contacto siempre; el resto solo si tienen contenido. */
export function visibleTabs(event: EventLike) {
  const html = parseCustomHtml(event.customHtml);
  const has = (key: EventTabKey, ...fields: (string | null | undefined)[]) => fields.some((f) => f && f.trim()) || Boolean(html[key]);
  return EVENT_TABS.filter((t) => {
    switch (t.key) {
      case "presentacion":
        return has(t.key, event.presentation);
      case "alojamiento":
        return has(t.key, event.accommodation, event.accommodations);
      case "programa":
        return has(t.key, event.program);
      case "etapas":
        return (event.stages?.length ?? 0) > 0 || Boolean(html.etapas);
      default:
        return true;
    }
  });
}

export function parseCustomHtml(raw: string | null | undefined): Partial<Record<EventTabKey, string>> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** "Etiqueta | Valor" por línea. */
export function parsePairs(raw: string | null | undefined) {
  return (raw ?? "")
    .split("\n")
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((p) => p[0])
    .map(([label, value = ""]) => ({ label, value }));
}

export type ProgramItem = { time: string; title: string; place?: string; note?: string };
export type ProgramDay = { title: string; items: ProgramItem[] };

/** "## Día" abre un bloque; "HH:MM | Título | Lugar | Notas" añade una fila. */
export function parseProgram(raw: string | null | undefined): ProgramDay[] {
  const days: ProgramDay[] = [];
  for (const line of (raw ?? "").split("\n")) {
    const l = line.trim();
    if (!l) continue;
    if (l.startsWith("##")) {
      days.push({ title: l.replace(/^#+\s*/, ""), items: [] });
      continue;
    }
    const [time, title, place, note] = l.split("|").map((x) => x.trim());
    if (!title) continue;
    if (days.length === 0) days.push({ title: "Programa", items: [] });
    days[days.length - 1].items.push({ time, title, place, note });
  }
  return days;
}

export function parseSchedule(raw: string | null | undefined): ProgramItem[] {
  return parseProgram(raw).flatMap((d) => d.items);
}

export type Accommodation = { name: string; location?: string; price?: string; contact?: string; notes?: string };

/** "Nombre | Localidad | Precio | Contacto | Notas" por línea. */
export function parseAccommodations(raw: string | null | undefined): Accommodation[] {
  return (raw ?? "")
    .split("\n")
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((p) => p[0])
    .map(([name, location, price, contact, notes]) => ({ name, location, price, contact, notes }));
}

// ─────────────────────────── GPX ───────────────────────────

export type GpxStats = {
  points: [number, number, number][]; // lat, lon, ele (simplificado)
  distanceKm: number;
  elevationGain: number;
  elevationLoss: number;
  minEle: number;
  maxEle: number;
  bounds: [[number, number], [number, number]];
  name?: string;
  segments?: number;
  hasElevation?: boolean;
};

function haversine(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * Analiza un archivo GPX sin dependencias externas.
 * Tolera lo que traen los archivos reales: atributos en cualquier orden, comillas
 * simples o dobles, prefijos de espacio de nombres (`<gpx:trkpt>`), etiquetas
 * autocerradas, extensiones de Garmin o Strava y varios tramos por pista.
 * La distancia no se acumula entre tramos distintos (evita saltos por pausas).
 */
export function parseGpx(xml: string, maxPoints = 700): GpxStats | null {
  const segments: [number, number, number][][] = [];
  let current: [number, number, number][] = [];

  const tokenRe = /<(\/?)(?:[\w-]+:)?(trkseg|trkpt|rtept|rte|trk)\b([^>]*?)(\/?)>/gi;
  let m: RegExpExecArray | null;
  const attr = (raw: string, name: string) => {
    const a = new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i").exec(raw);
    return a ? parseFloat(a[1]) : NaN;
  };

  while ((m = tokenRe.exec(xml))) {
    const [, closing, tag, rawAttrs, selfClosing] = m;
    const kind = tag.toLowerCase();

    if (kind === "trkseg" || kind === "rte") {
      // Un nuevo tramo corta la continuidad del recorrido
      if (current.length) segments.push(current);
      current = [];
      continue;
    }
    if (closing || kind === "trk") continue;
    if (kind !== "trkpt" && kind !== "rtept") continue;

    const lat = attr(rawAttrs, "lat");
    const lon = attr(rawAttrs, "lon");
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;

    let ele = 0;
    if (!selfClosing) {
      // La altitud va dentro del punto; se busca solo hasta que el punto se cierra
      const rest = xml.slice(m.index + m[0].length, m.index + m[0].length + 2000);
      const end = rest.search(/<\/(?:[\w-]+:)?(?:trkpt|rtept)>/i);
      const inner = end === -1 ? rest : rest.slice(0, end);
      const eleMatch = /<(?:[\w-]+:)?ele>\s*(-?[\d.]+)\s*<\//i.exec(inner);
      if (eleMatch) ele = parseFloat(eleMatch[1]);
    }
    current.push([lat, lon, Number.isFinite(ele) ? ele : 0]);
  }
  if (current.length) segments.push(current);

  const all = segments.flat();
  if (all.length < 2) return null;

  // Distancia: solo dentro de cada tramo
  let distanceKm = 0;
  for (const seg of segments) {
    for (let i = 1; i < seg.length; i++) distanceKm += haversine([seg[i - 1][0], seg[i - 1][1]], [seg[i][0], seg[i][1]]);
  }

  // Desnivel: media móvil para quitar el ruido del GPS y umbral de 1 metro
  const eles = all.map((p) => p[2]);
  const hasEle = eles.some((e) => e !== 0);
  const win = 5;
  const smoothed = eles.map((_, i) => {
    const from = Math.max(0, i - win), to = Math.min(eles.length, i + win + 1);
    let sum = 0;
    for (let j = from; j < to; j++) sum += eles[j];
    return sum / (to - from);
  });
  let gain = 0, loss = 0, ref = smoothed[0];
  for (const e of smoothed) {
    const d = e - ref;
    if (Math.abs(d) < 1) continue;
    if (d > 0) gain += d; else loss -= d;
    ref = e;
  }

  const lats = all.map((p) => p[0]), lons = all.map((p) => p[1]);
  const step = Math.max(1, Math.ceil(all.length / maxPoints));
  const points = all
    .filter((_, i) => i % step === 0 || i === all.length - 1)
    .map(([a, b, c]) => [Number(a.toFixed(5)), Number(b.toFixed(5)), Math.round(c)] as [number, number, number]);
  const nameMatch = /<(?:[\w-]+:)?name>\s*(?:<!\[CDATA\[)?([^<\]]{1,120})/i.exec(xml);

  return {
    points,
    distanceKm: Math.round(distanceKm * 10) / 10,
    elevationGain: hasEle ? Math.round(gain) : 0,
    elevationLoss: hasEle ? Math.round(loss) : 0,
    minEle: hasEle ? Math.round(Math.min(...eles)) : 0,
    maxEle: hasEle ? Math.round(Math.max(...eles)) : 0,
    bounds: [[Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]],
    name: nameMatch?.[1]?.trim(),
    segments: segments.length,
    hasElevation: hasEle,
  };
}

export function parseGpxStats(raw: string | null | undefined): GpxStats | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GpxStats;
  } catch {
    return null;
  }
}

// ─────────────────────────── Plantillas ───────────────────────────

export type EventTemplate = {
  key: string;
  name: string;
  description: string;
  fields: {
    subtitle: string;
    highlights: string;
    intro: string;
    presentation: string;
    accommodation: string;
    accommodations: string;
    program: string;
    registrationInfo: string;
    contactInfo: string;
  };
  stages: { name: string; startTime: string; startPlace: string; endPlace: string; distanceKm: number; elevationM: number; description: string; schedule: string }[];
  /** Modalidades de inscripción que se crean con el evento. */
  tickets: { name: string; description: string; priceCents: number; memberPriceCents: number | null; capacity: number | null }[];
  /** Datos del participante que pide la organización. */
  requiredFields: string[];
};

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    key: "marcha-ciclista",
    name: "Marcha ciclista por etapas",
    description: "Portada, presentación, alojamiento, programa día a día, etapas con GPX, inscripciones y contacto. Ideal para la Marcha Ciclista Bomberos.",
    fields: {
      subtitle: "Dos días de pedales, compañerismo y sierra madrileña",
      highlights: "Fechas | 11 y 12 de octubre\nSalida | Parque Central de Bomberos, Madrid\nRecorrido | 2 etapas · 215 km · 3.900 m+\nNivel | Cicloturista con buena forma física\nPlazas | 150 participantes",
      intro: "La **Marcha Ciclista Bomberos** es la cita cicloturista del Club Deportivo Bomberos de Madrid: dos etapas por la Sierra de Guadarrama, con avituallamientos, coche escoba, asistencia mecánica y una noche de convivencia en la sierra.\n\nAbierta a socios, bomberos de otros cuerpos, familiares y amigos. Ritmo de marcha, no competitivo, con grupos por nivel.",
      presentation: "## Una marcha con espíritu de parque\n\nNacida en 2018 como salida interna de la sección de ciclismo, la marcha se ha convertido en un encuentro anual de bomberos ciclistas de toda España. Dos etapas de montaña, un ritmo de marcha y muchas historias que contar en el avituallamiento.\n\n## Qué incluye la inscripción\n\n- Maillot conmemorativo de la edición\n- Avituallamientos sólidos y líquidos en cada etapa\n- Coche escoba y asistencia mecánica\n- Seguro de accidentes y responsabilidad civil\n- Cena de convivencia del sábado y desayuno del domingo\n- Transporte de equipaje entre etapas\n- Diploma finisher y foto de grupo\n\n## Reglamento básico\n\n- Casco obligatorio en todo momento.\n- Se respetan las normas de circulación: la marcha discurre por carreteras abiertas al tráfico.\n- Ritmo de marcha: los grupos se reagrupan en los puntos indicados.\n- La organización puede cerrar el control a la hora prevista por seguridad.",
      accommodation: "## Noche del sábado en la sierra\n\nLa organización ha bloqueado plazas en alojamientos de Cercedilla y Navacerrada con precios especiales para participantes. Reserva directamente con el alojamiento indicando **Marcha Ciclista Bomberos**. Se recomienda reservar antes del 30 de septiembre.\n\nEl transporte del equipaje entre el Parque Central y el alojamiento está incluido en la inscripción.",
      accommodations: "Hotel Sierra Cercedilla | Cercedilla | 55 € hab. doble con desayuno | 918 000 000 | Guardabicis vigilado\nAlbergue Peñalara | Navacerrada | 28 € por persona | reservas@albergue.es | Literas en habitaciones de 4\nHostal Los Ángeles | Cercedilla | 45 € hab. doble | 918 000 001 | A 300 m del punto de salida",
      program: "## Viernes 10 de octubre · Víspera\n18:00 | Entrega de dorsales y maillots | Parque Central de Bomberos, C/ Imperial 10\n19:30 | Briefing de la marcha | Salón de actos del Parque Central\n## Sábado 11 de octubre · Etapa 1\n07:00 | Desayuno y última entrega de dorsales | Parque Central de Bomberos\n08:00 | Salida neutralizada | Puerta del Parque Central\n11:30 | Avituallamiento | Alto del León\n14:30 | Llegada prevista y comida | Cercedilla, plaza Mayor\n20:30 | Cena de convivencia | Restaurante del hotel\n## Domingo 12 de octubre · Etapa 2\n07:30 | Desayuno | Alojamiento\n08:30 | Salida | Cercedilla, plaza Mayor\n11:00 | Avituallamiento | Puerto de Navacerrada\n14:00 | Llegada y comida de clausura | Parque Central de Bomberos\n16:00 | Entrega de diplomas y foto de grupo | Patio del Parque Central",
      registrationInfo: "## Cómo inscribirse\n\n1. Crea tu cuenta o accede con la que ya tienes.\n2. Pulsa **Inscribirme** y completa el pago con tarjeta.\n3. Recibirás la confirmación por correo. El dorsal se entrega el viernes por la tarde o el sábado a primera hora.\n\n## Precios\n\n- Socios del club: precio reducido (se aplica automáticamente).\n- Resto de participantes: precio general.\n\n## Política de cancelación\n\nDevolución del 100 % hasta 15 días antes, del 50 % hasta 7 días antes. En los 7 días previos no hay devolución salvo causa médica justificada.",
      contactInfo: "Para dudas sobre el recorrido, alojamiento o material, escribe a la sección de ciclismo. Durante la marcha habrá un teléfono de organización activo las 24 horas.",
    },
    stages: [
      { name: "Madrid – Cercedilla por el Alto del León", startTime: "08:00", startPlace: "Parque Central de Bomberos, Madrid", endPlace: "Cercedilla, plaza Mayor", distanceKm: 118, elevationM: 2100, description: "Salida neutralizada por Madrid hasta Las Rozas. Primer puerto en el Alto del León (1.511 m) por Guadarrama y descenso a San Rafael. Regreso por Los Molinos hasta Cercedilla.", schedule: "08:00 | Salida neutralizada | Parque Central\n09:15 | Fin de neutralizada, primer reagrupamiento | Las Rozas\n11:30 | Avituallamiento y reagrupamiento | Alto del León\n13:00 | Reagrupamiento | San Rafael\n14:30 | Llegada | Cercedilla" },
      { name: "Cercedilla – Madrid por Navacerrada y Morcuera", startTime: "08:30", startPlace: "Cercedilla, plaza Mayor", endPlace: "Parque Central de Bomberos, Madrid", distanceKm: 97, elevationM: 1800, description: "Etapa reina: Puerto de Navacerrada (1.858 m) y Puerto de la Morcuera (1.796 m) antes de bajar a Madrid por Colmenar Viejo. Corte de control en la Morcuera a las 12:30.", schedule: "08:30 | Salida | Cercedilla\n10:00 | Avituallamiento | Puerto de Navacerrada\n11:45 | Reagrupamiento | Rascafría\n12:30 | Corte de control | Puerto de la Morcuera\n14:00 | Llegada y comida | Parque Central" },
    ],
    tickets: [
      { name: "Marcha completa · 2 etapas", description: "Las dos etapas, maillot conmemorativo, avituallamientos, cena del sábado, desayuno del domingo y transporte de equipaje.", priceCents: 6500, memberPriceCents: 4500, capacity: 120 },
      { name: "Solo etapa 1 · Madrid – Cercedilla", description: "Sábado. Incluye maillot, avituallamientos y comida de llegada. No incluye alojamiento ni cena.", priceCents: 3500, memberPriceCents: 2500, capacity: 40 },
      { name: "Solo etapa 2 · Cercedilla – Madrid", description: "Domingo. Incluye maillot, avituallamientos y comida de clausura.", priceCents: 3500, memberPriceCents: 2500, capacity: 40 },
      { name: "Acompañante", description: "Para quien no pedalea: cena del sábado, comida de clausura y transporte entre etapas.", priceCents: 3000, memberPriceCents: 2000, capacity: 50 },
    ],
    requiredFields: ["dni", "birthDate", "shirtSize", "clubName", "emergencyName", "emergencyPhone", "medicalNotes"],
  },
  {
    key: "carrera",
    name: "Carrera popular / trail",
    description: "Portada, presentación, programa del día e inscripciones. Sin alojamiento ni etapas.",
    fields: {
      subtitle: "Corre con los bomberos de Madrid",
      highlights: "Fecha | Por confirmar\nSalida | Por confirmar\nDistancia | 10 km\nDorsales | Hasta agotar",
      intro: "Carrera popular organizada por el Club Deportivo Bomberos de Madrid. Abierta a todos los públicos.",
      presentation: "## La carrera\n\nDescribe aquí el recorrido, el fin solidario y qué incluye el dorsal (camiseta, chip, avituallamiento, seguro).",
      accommodation: "",
      accommodations: "",
      program: "## Día de la carrera\n08:00 | Recogida de dorsales | Zona de salida\n09:30 | Salida | Línea de salida\n11:00 | Entrega de premios | Meta",
      registrationInfo: "## Cómo inscribirse\n\nCrea tu cuenta, pulsa **Inscribirme** y completa el pago. Los socios tienen precio reducido.",
      contactInfo: "",
    },
    stages: [],
    tickets: [
      { name: "Inscripción general", description: "Dorsal con chip, camiseta técnica, avituallamiento y seguro.", priceCents: 1200, memberPriceCents: 800, capacity: null },
    ],
    requiredFields: ["dni", "birthDate", "shirtSize", "emergencyPhone"],
  },
  {
    key: "en-blanco",
    name: "En blanco",
    description: "Solo los datos básicos. Rellena las pestañas que necesites.",
    fields: { subtitle: "", highlights: "", intro: "", presentation: "", accommodation: "", accommodations: "", program: "", registrationInfo: "", contactInfo: "" },
    stages: [],
    tickets: [],
    requiredFields: [],
  },
];

export const getTemplate = (key: string) => EVENT_TEMPLATES.find((t) => t.key === key);
