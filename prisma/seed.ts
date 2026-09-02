import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EVENT_TEMPLATES, parseGpx } from "../src/lib/event-page";

const prisma = new PrismaClient();
const year = new Date().getFullYear();
const d = (offsetDays: number, hour = 10) => {
  const x = new Date();
  x.setDate(x.getDate() + offsetDays);
  x.setHours(hour, 0, 0, 0);
  return x;
};

async function main() {
  console.log("🌱 Sembrando datos del Club Deportivo Bomberos de Madrid…");

  // ─── Usuarios ───
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@clubdeportivobomberos.es";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin1234!";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: "Administración CDB", email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 12), role: "ADMIN", isFirefighter: true },
  });
  const socio = await prisma.user.upsert({
    where: { email: "socio@demo.es" },
    update: {},
    create: { name: "Laura Gómez", email: "socio@demo.es", passwordHash: await bcrypt.hash("Socio1234!", 12), role: "SOCIO", isFirefighter: true, phone: "600123456" },
  });
  await prisma.user.upsert({
    where: { email: "participante@demo.es" },
    update: {},
    create: { name: "Carlos Ruiz", email: "participante@demo.es", passwordHash: await bcrypt.hash("Participante1234!", 12), role: "PARTICIPANTE" },
  });

  // ─── Planes de socio ───
  const plans = [
    { slug: "bombero", name: "Socio bombero", priceCents: 6000, description: "Para miembros del Cuerpo de Bomberos del Ayuntamiento de Madrid, en activo o jubilados.", benefits: ["Acceso a todas las secciones deportivas", "Descuento en tienda oficial y eventos", "Seguro deportivo federado", "Voto en la asamblea general", "Equipación oficial de bienvenida"] },
    { slug: "familiar", name: "Socio familiar", priceCents: 4000, description: "Para familiares directos de bomberos socios: pareja e hijos/as.", benefits: ["Acceso a las secciones deportivas", "Descuento en tienda y eventos", "Seguro deportivo federado", "Actividades familiares"] },
    { slug: "simpatizante", name: "Socio simpatizante", priceCents: 3000, description: "Para cualquier persona que quiera apoyar y participar en la vida del club.", benefits: ["Participación en eventos abiertos", "Descuento en tienda oficial", "Boletín y actualidad del club", "Carné de simpatizante"] },
  ];
  const planMap: Record<string, string> = {};
  for (const p of plans) {
    const row = await prisma.membershipPlan.upsert({ where: { slug: p.slug }, update: { ...p, benefits: JSON.stringify(p.benefits) }, create: { ...p, benefits: JSON.stringify(p.benefits) } });
    planMap[p.slug] = row.id;
  }

  // Membresía activa de demo
  const existing = await prisma.membership.findUnique({ where: { userId_season: { userId: socio.id, season: year } } });
  if (!existing) {
    await prisma.membership.create({
      data: { userId: socio.id, memberNumber: 1001, season: year, planId: planMap.bombero, status: "ACTIVE", amountCents: 6000, paidAt: new Date(`${year}-01-15`), startsAt: new Date(`${year}-01-01`), expiresAt: new Date(`${year}-12-31`) },
    });
  }

  // ─── Secciones ───
  const sections = [
    { slug: "atletismo", name: "Atletismo", icon: "Footprints", tagline: "Correr, saltar, lanzar: el deporte base del bombero.", coach: "Marta Sánchez", description: "La sección de atletismo del club agrupa a corredores de fondo, medio fondo, velocidad y trail. Entrenamos en la pista de Vallehermoso y en la Casa de Campo, y participamos en el circuito de carreras populares de Madrid, en el Campeonato de España de Bomberos y en maratones nacionales e internacionales.\n\n## Grupos de entrenamiento\n\n- **Iniciación**: para quien empieza a correr o quiere volver a hacerlo con cabeza.\n- **Ruta y maratón**: planes de 10K, media y maratón.\n- **Trail y montaña**: salidas de fin de semana por la Sierra de Guadarrama.", schedule: [{ day: "Martes", time: "19:00 - 20:30", place: "Pista de Vallehermoso" }, { day: "Jueves", time: "19:00 - 20:30", place: "Pista de Vallehermoso" }, { day: "Sábado", time: "09:00", place: "Casa de Campo (tirada larga)" }] },
    { slug: "futbol", name: "Fútbol", icon: "Goal", tagline: "Fútbol 11 y fútbol 7 en las ligas de bomberos y municipales.", coach: "Javier Ortega", description: "Nuestro equipo de fútbol compite en la Liga de Bomberos de la Comunidad de Madrid y en torneos benéficos. Contamos con equipo de fútbol 11 y dos equipos de fútbol 7, además de partidos amistosos contra cuerpos de Policía Municipal, SAMUR y otros parques de bomberos.\n\n## Competiciones\n\n- Liga de Bomberos de Madrid\n- Torneo Nacional de Cuerpos de Emergencias\n- Torneo benéfico anual a favor de la Fundación Bomberos", schedule: [{ day: "Lunes", time: "20:00 - 21:30", place: "Campo municipal de La Elipa" }, { day: "Miércoles", time: "20:00 - 21:30", place: "Campo municipal de La Elipa" }] },
    { slug: "rugby", name: "Rugby", icon: "Shield", tagline: "Valores, contacto y tercer tiempo. Como en el parque.", coach: "Andrés Fernández", description: "El rugby es el deporte que mejor refleja el espíritu de un cuerpo de bomberos: equipo, sacrificio y respeto. Nuestro XV participa en el Torneo Internacional de Rugby de Bomberos y organiza cada primavera el Torneo de Rugby Bomberos Madrid, con equipos de toda España.\n\nAbierto a jugadores de todos los niveles, incluyendo iniciación de adultos.", schedule: [{ day: "Martes", time: "20:30 - 22:00", place: "Campo de rugby de Vallecas" }, { day: "Jueves", time: "20:30 - 22:00", place: "Campo de rugby de Vallecas" }] },
    { slug: "ciclismo", name: "Ciclismo", icon: "Bike", tagline: "Carretera, MTB y gravel por la sierra madrileña.", coach: "Pablo Iglesias", description: "Salidas semanales de carretera y montaña, marchas cicloturistas y participación en la Quebrantahuesos, la Perico Delgado y la Titan Desert. Grupos por nivel y rutas publicadas cada semana en el canal de la sección.", schedule: [{ day: "Sábado", time: "08:00", place: "Salida desde el Parque Central" }, { day: "Domingo", time: "08:00", place: "MTB · El Pardo" }] },
    { slug: "natacion", name: "Natación", icon: "Waves", tagline: "Piscina, aguas abiertas y salvamento.", coach: "Elena Prieto", description: "Entrenamientos de natación en piscina de 50 metros, travesías de aguas abiertas y preparación de pruebas de salvamento y socorrismo, muy vinculadas a la formación de bombero. Grupos de iniciación, perfeccionamiento y competición máster.", schedule: [{ day: "Lunes", time: "21:00 - 22:00", place: "Piscina M-86" }, { day: "Miércoles", time: "21:00 - 22:00", place: "Piscina M-86" }, { day: "Viernes", time: "21:00 - 22:00", place: "Piscina M-86" }] },
    { slug: "triatlon", name: "Triatlón", icon: "Timer", tagline: "Tres deportes, una familia. Del sprint al Ironman.", coach: "Sergio Molina", description: "Sección multidisciplinar que combina las escuelas de natación, ciclismo y atletismo. Preparamos triatlones sprint y olímpicos, medio Ironman y el Ironman de Vitoria como gran objetivo anual del club.", schedule: [{ day: "Consultar", time: "Plan semanal", place: "Combinado con natación, ciclismo y atletismo" }] },
    { slug: "montana", name: "Montaña y escalada", icon: "Mountain", tagline: "Senderismo, alpinismo y escalada. Nuestro medio natural.", coach: "Rocío Navarro", description: "Actividades de montaña durante todo el año: senderismo, raquetas, alpinismo invernal, escalada en rocódromo y en roca. Organizamos la Travesía Bomberos de la Sierra de Guadarrama y expediciones anuales a Pirineos y Alpes.", schedule: [{ day: "Jueves", time: "19:30 - 21:30", place: "Rocódromo municipal" }, { day: "Fin de semana", time: "Calendario mensual", place: "Sierra de Guadarrama" }] },
    { slug: "padel", name: "Pádel", icon: "Racket", tagline: "Liga interna, torneos y mucho compañerismo.", coach: "Nacho Vidal", description: "Liga interna por categorías durante toda la temporada, torneos abiertos a familiares y amigos y participación en el Campeonato de Pádel de Bomberos de España.", schedule: [{ day: "Martes", time: "19:00 - 21:00", place: "Pistas de pádel Fuencarral" }, { day: "Viernes", time: "18:00 - 20:00", place: "Pistas de pádel Fuencarral" }] },
    { slug: "baloncesto", name: "Baloncesto", icon: "Dribbble", tagline: "Competimos en liga municipal y en el Nacional de Bomberos.", coach: "Diego Campos", description: "Equipo sénior masculino y femenino. Entrenamientos semanales y competición en la liga municipal de Madrid y el Campeonato Nacional de Baloncesto de Bomberos.", schedule: [{ day: "Miércoles", time: "20:30 - 22:00", place: "Polideportivo La Chopera" }] },
    { slug: "crossfit", name: "CrossFit y fuerza", icon: "Dumbbell", tagline: "Preparación física funcional para el servicio y la vida.", coach: "Aitor Beltrán", description: "Entrenamiento funcional de alta intensidad orientado a las exigencias físicas del bombero. Preparación de oposiciones, competiciones de fitness de emergencias (Firefighter Challenge) y clases abiertas para socios.", schedule: [{ day: "Lunes a viernes", time: "07:00 y 18:30", place: "Box del Parque Central" }] },
  ];
  const sectionMap: Record<string, string> = {};
  for (const [i, s] of sections.entries()) {
    const row = await prisma.section.upsert({
      where: { slug: s.slug },
      update: { name: s.name, icon: s.icon, tagline: s.tagline, description: s.description, schedule: JSON.stringify(s.schedule), coach: s.coach, order: i, coverImage: `/images/sections/${s.slug}.svg`, contactEmail: `${s.slug}@clubdeportivobomberos.es` },
      create: { slug: s.slug, name: s.name, icon: s.icon, tagline: s.tagline, description: s.description, schedule: JSON.stringify(s.schedule), coach: s.coach, order: i, coverImage: `/images/sections/${s.slug}.svg`, contactEmail: `${s.slug}@clubdeportivobomberos.es` },
    });
    sectionMap[s.slug] = row.id;
  }

  // ─── Noticias ───
  const posts = [
    { slug: "campeonato-espana-bomberos-atletismo", title: "El club brilla en el Campeonato de España de Bomberos de Atletismo", excerpt: "Siete medallas y récord de participación para nuestra sección de atletismo en Valencia.", section: "atletismo", featured: true, days: -3, content: "La sección de atletismo del Club Deportivo Bomberos de Madrid regresó de Valencia con **siete medallas** en el Campeonato de España de Bomberos, tres de ellas de oro en 5.000 metros, 1.500 metros y relevo 4x400.\n\nEl equipo, formado por 24 atletas, logró además el récord de participación del club en una cita nacional.\n\n## Resultados destacados\n\n- Oro en 5.000 m masculino\n- Oro en 1.500 m femenino\n- Oro en relevo 4x400 mixto\n- Plata en salto de longitud\n\n> \"Este resultado es fruto de todo un año de trabajo en la pista de Vallehermoso\", destacó la entrenadora Marta Sánchez." },
    { slug: "torneo-rugby-bomberos-madrid-2026", title: "Abiertas las inscripciones para el Torneo de Rugby Bomberos Madrid", excerpt: "La séptima edición reunirá a 12 equipos de cuerpos de bomberos de toda España en Vallecas.", section: "rugby", featured: true, days: -6, content: "El Torneo de Rugby Bomberos Madrid celebra su séptima edición el próximo mes con la participación confirmada de 12 equipos de cuerpos de bomberos de toda España y una selección invitada de Portugal.\n\nLas inscripciones para equipos ya están abiertas y el tercer tiempo se celebrará en el Parque Central con entrada libre para socios y familiares." },
    { slug: "nueva-equipacion-oficial-2026", title: "Presentamos la nueva equipación oficial del club", excerpt: "Rojo y negro en un diseño renovado, ya disponible en la tienda oficial con descuento para socios.", featured: true, days: -10, content: "La nueva equipación del Club Deportivo Bomberos de Madrid ya está disponible en nuestra tienda oficial. Un diseño que mantiene los colores rojo y negro del cuerpo con un patrón de franjas inspirado en las bandas reflectantes del uniforme de intervención.\n\nLos socios disfrutan de un **15% de descuento** en toda la colección." },
    { slug: "asamblea-general-ordinaria", title: "Convocatoria de Asamblea General Ordinaria", excerpt: "Se convoca a todos los socios a la asamblea anual donde se presentarán las cuentas y el plan deportivo.", days: -14, content: "La Junta Directiva convoca a todos los socios del club a la Asamblea General Ordinaria que se celebrará en el salón de actos del Parque Central de Bomberos.\n\n## Orden del día\n\n1. Lectura y aprobación del acta anterior\n2. Presentación de cuentas de la temporada\n3. Plan deportivo y presupuesto\n4. Ruegos y preguntas" },
    { slug: "ciclismo-quebrantahuesos", title: "Quince socios completan la Quebrantahuesos", excerpt: "La sección de ciclismo vuelve a plantar la bandera del club en Sabiñánigo.", section: "ciclismo", days: -20, content: "Quince miembros de la sección de ciclismo completaron los 200 kilómetros y 3.500 metros de desnivel de la Quebrantahuesos, la marcha cicloturista más emblemática de España.\n\nEl grupo cerró la temporada de grandes marchas con un balance de más de 40 finishers en Perico Delgado, Quebrantahuesos y La Indomable." },
    { slug: "escuela-natacion-aguas-abiertas", title: "Arranca la escuela de aguas abiertas en el pantano de San Juan", excerpt: "Nuevo grupo de iniciación con sesiones quincenales de mayo a septiembre.", section: "natacion", days: -28, content: "La sección de natación pone en marcha su escuela de aguas abiertas para socios de todos los niveles. Sesiones quincenales en el pantano de San Juan con monitores titulados en salvamento acuático." },
    { slug: "torneo-benefico-futbol-fundacion", title: "El torneo benéfico de fútbol recauda 4.200 € para la Fundación Bomberos", excerpt: "Policía Municipal, SAMUR y Bomberos compartieron una jornada solidaria en La Elipa.", section: "futbol", days: -35, content: "El Torneo Benéfico de Fútbol de los Cuerpos de Emergencias de Madrid reunió a más de 300 personas en el campo municipal de La Elipa y recaudó 4.200 euros para la Fundación Bomberos, destinados a la ayuda a familias afectadas por incendios." },
    { slug: "firefighter-challenge-madrid", title: "Madrid acogerá el Firefighter Challenge nacional", excerpt: "La sección de CrossFit organiza la prueba más exigente del calendario de bomberos.", section: "crossfit", days: -42, content: "El Parque Central de Bomberos será el escenario del Firefighter Challenge nacional, una prueba que simula las exigencias físicas de una intervención real: subida de torre con manguera, arrastre de maniquí y golpeo con mazo." },
  ];
  for (const p of posts) {
    const data = { title: p.title, excerpt: p.excerpt, content: p.content, featured: p.featured ?? false, publishedAt: d(p.days, 9), sectionId: p.section ? sectionMap[p.section] : null, authorId: admin.id, coverImage: `/images/news/${p.slug}.svg` };
    await prisma.post.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data } });
  }

  // ─── Eventos ───
  const events = [
    { slug: "torneo-rugby-bomberos-madrid", title: "VII Torneo de Rugby Bomberos Madrid", section: "rugby", days: 25, hour: 9, location: "Campo de rugby de Vallecas", priceCents: 1500, memberPriceCents: 0, capacity: 200, description: "Torneo de rugby a 15 entre cuerpos de bomberos de toda España. Entrada con tercer tiempo incluido: comida, bebida y camiseta conmemorativa.\n\n## Programa\n\n- 09:00 Recepción de equipos\n- 10:00 Fase de grupos\n- 15:00 Semifinales y final\n- 18:00 Tercer tiempo en el Parque Central" },
    { slug: "carrera-popular-bomberos-madrid", title: "Carrera Popular Bomberos de Madrid 10K", section: "atletismo", days: 40, hour: 9, location: "Salida en Plaza de Cibeles", priceCents: 1200, memberPriceCents: 800, capacity: 1500, description: "Carrera solidaria de 10 kilómetros por el centro de Madrid. Los beneficios se destinan a la Fundación Bomberos. Incluye dorsal con chip, camiseta técnica y avituallamiento." },
    { slug: "travesia-sierra-guadarrama", title: "Travesía Bomberos de la Sierra de Guadarrama", section: "montana", days: 55, hour: 7, location: "Puerto de Navacerrada", priceCents: 2500, memberPriceCents: 1500, capacity: 80, description: "Travesía de 28 km por la Cuerda Larga con guías de montaña del club. Nivel medio-alto. Incluye seguro, transporte de vuelta y comida en Cercedilla." },
    { slug: "torneo-padel-familias", title: "Torneo de Pádel de Familias", section: "padel", days: 18, hour: 10, location: "Pistas de pádel Fuencarral", priceCents: 1000, memberPriceCents: 500, capacity: 64, description: "Torneo por parejas abierto a socios, familiares y amigos. Categorías A, B y mixta. Premios y comida de clausura." },
    { slug: "gala-anual-club", title: "Gala anual del Club Deportivo Bomberos de Madrid", days: 90, hour: 20, location: "Salón de actos del Parque Central", priceCents: 3500, memberPriceCents: 2500, capacity: 250, description: "Cena de gala con entrega de premios a los deportistas de la temporada, homenaje a los socios veteranos y música en directo." },
  ];
  for (const e of events) {
    const data = { title: e.title, description: e.description, startsAt: d(e.days, e.hour), location: e.location, priceCents: e.priceCents, memberPriceCents: e.memberPriceCents, capacity: e.capacity, registrationDeadline: d(e.days - 2, 23), sectionId: e.section ? sectionMap[e.section] : null, coverImage: `/images/events/${e.slug}.svg`, published: true };
    await prisma.event.upsert({ where: { slug: e.slug }, update: data, create: { slug: e.slug, ...data } });
  }

  // ─── Marcha Ciclista Bomberos: evento con microweb completa (plantilla) ───
  const tpl = EVENT_TEMPLATES.find((t) => t.key === "marcha-ciclista")!;
  const marchaData = {
    title: "Marcha Ciclista Bomberos",
    description: "Dos etapas cicloturistas por la Sierra de Guadarrama con avituallamientos, coche escoba, noche de convivencia en Cercedilla y maillot conmemorativo.",
    startsAt: d(39, 8),
    endsAt: d(40, 16),
    location: "Parque Central de Bomberos, Madrid",
    priceCents: 6500,
    memberPriceCents: 4500,
    capacity: 150,
    registrationDeadline: d(32, 23),
    sectionId: sectionMap.ciclismo,
    coverImage: "/images/events/marcha-ciclista-bomberos.svg",
    heroImage: "/images/events/marcha-ciclista-bomberos.svg",
    published: true,
    contactName: "Sección de ciclismo · Pablo Iglesias",
    contactEmail: "ciclismo@clubdeportivobomberos.es",
    contactPhone: "+34 600 000 000",
    ...tpl.fields,
  };
  const marcha = await prisma.event.upsert({ where: { slug: "marcha-ciclista-bomberos" }, update: marchaData, create: { slug: "marcha-ciclista-bomberos", ...marchaData } });
  await prisma.eventStage.deleteMany({ where: { eventId: marcha.id } });
  const gpxFiles = ["etapa-1-madrid-cercedilla.gpx", "etapa-2-cercedilla-madrid.gpx"];
  let totalKm = 0;
  let totalEle = 0;
  for (const [i, st] of tpl.stages.entries()) {
    const gpxData = readFileSync(join(__dirname, "gpx", gpxFiles[i]), "utf8");
    const stats = parseGpx(gpxData)!;
    totalKm += stats.distanceKm;
    totalEle += stats.elevationGain;
    await prisma.eventStage.create({
      data: { eventId: marcha.id, order: i, name: st.name, date: d(39 + i, 8), startTime: st.startTime, startPlace: st.startPlace, endPlace: st.endPlace, distanceKm: stats.distanceKm, elevationM: stats.elevationGain, description: st.description, schedule: st.schedule, gpxName: gpxFiles[i], gpxData, gpxStats: JSON.stringify(stats) },
    });
  }
  await prisma.event.update({
    where: { id: marcha.id },
    data: { highlights: tpl.fields.highlights.replace(/Recorrido \|.*/, `Recorrido | 2 etapas · ${Math.round(totalKm)} km · ${totalEle.toLocaleString("es-ES")} m+`) },
  });

  await prisma.eventTicket.deleteMany({ where: { eventId: marcha.id } });
  for (const [i, t] of tpl.tickets.entries()) {
    await prisma.eventTicket.create({ data: { eventId: marcha.id, order: i, name: t.name, description: t.description, priceCents: t.priceCents, memberPriceCents: t.memberPriceCents, capacity: t.capacity } });
  }

  // Responsable de la sección de ciclismo (puede crear noticias y eventos de su sección)
  await prisma.user.upsert({
    where: { email: "ciclismo@demo.es" },
    update: { managedSectionId: sectionMap.ciclismo },
    create: { name: "Pablo Iglesias", email: "ciclismo@demo.es", passwordHash: await bcrypt.hash("Ciclismo1234!", 12), role: "SOCIO", isFirefighter: true, managedSectionId: sectionMap.ciclismo },
  });
  await prisma.event.deleteMany({ where: { slug: "marcha-cicloturista-bomberos" } });

  // ─── Tienda ───
  const sizes = ["S", "M", "L", "XL", "XXL"];
  const products = [
    { slug: "camiseta-oficial-2026", name: "Camiseta oficial 2026", category: "Equipación", priceCents: 3500, memberPriceCents: 2975, featured: true, description: "Camiseta técnica oficial del club en rojo y negro con escudo bordado. Tejido transpirable de secado rápido.", variants: sizes.map((s) => ({ size: s, color: "Rojo", stock: s === "XXL" ? 3 : 25 })) },
    { slug: "sudadera-capucha-club", name: "Sudadera con capucha", category: "Ropa", priceCents: 4500, memberPriceCents: 3825, featured: true, description: "Sudadera negra de algodón orgánico con escudo del club en el pecho y \"Bomberos Madrid\" en la espalda.", variants: sizes.map((s) => ({ size: s, color: "Negro", stock: 15 })) },
    { slug: "chaqueta-tecnica-entrenamiento", name: "Chaqueta técnica de entrenamiento", category: "Equipación", priceCents: 6500, memberPriceCents: 5525, featured: true, description: "Chaqueta cortavientos con detalles reflectantes inspirados en el uniforme de intervención.", variants: sizes.slice(0, 4).map((s) => ({ size: s, color: "Negro/Rojo", stock: 10 })) },
    { slug: "gorra-club", name: "Gorra oficial", category: "Accesorios", priceCents: 1800, memberPriceCents: 1530, description: "Gorra ajustable en negro con escudo bordado en rojo.", variants: [{ size: "Única", color: "Negro", stock: 40 }, { size: "Única", color: "Rojo", stock: 30 }] },
    { slug: "maillot-ciclismo", name: "Maillot de ciclismo", category: "Equipación", priceCents: 5900, memberPriceCents: 5015, description: "Maillot de manga corta con cremallera completa, tres bolsillos traseros y diseño oficial de la sección de ciclismo.", variants: sizes.map((s) => ({ size: s, color: "Rojo/Negro", stock: 8 })) },
    { slug: "bolsa-deporte", name: "Bolsa de deporte", category: "Accesorios", priceCents: 3200, memberPriceCents: 2720, description: "Bolsa de 45 litros con compartimento para calzado y escudo del club.", variants: [{ size: "Única", color: "Negro", stock: 20 }] },
    { slug: "camiseta-rugby", name: "Camiseta de rugby", category: "Equipación", priceCents: 4800, memberPriceCents: 4080, description: "Camiseta de rugby reforzada con cuello clásico y franjas rojas y negras.", variants: sizes.map((s) => ({ size: s, color: "Rojo/Negro", stock: 12 })) },
    { slug: "botella-termica", name: "Botella térmica 750 ml", category: "Accesorios", priceCents: 2200, memberPriceCents: 1870, description: "Botella de acero inoxidable de doble pared con logo del club. Mantiene el frío 24 horas.", variants: [{ size: "750 ml", color: "Negro", stock: 0 }, { size: "750 ml", color: "Rojo", stock: 35 }] },
  ];
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, category: p.category, priceCents: p.priceCents, memberPriceCents: p.memberPriceCents, description: p.description, featured: p.featured ?? false, images: JSON.stringify([`/images/products/${p.slug}.svg`]) },
      create: { slug: p.slug, name: p.name, category: p.category, priceCents: p.priceCents, memberPriceCents: p.memberPriceCents, description: p.description, featured: p.featured ?? false, images: JSON.stringify([`/images/products/${p.slug}.svg`]) },
    });
    for (const v of p.variants) {
      const sku = `${p.slug}-${v.color}-${v.size}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.productVariant.upsert({ where: { sku }, update: { stock: v.stock, size: v.size, color: v.color }, create: { productId: product.id, sku, size: v.size, color: v.color, stock: v.stock } });
    }
  }

  console.log("✅ Datos cargados.");
  console.log(`   Admin:        ${adminEmail} / ${adminPassword}`);
  console.log("   Socio demo:   socio@demo.es / Socio1234!");
  console.log("   Participante: participante@demo.es / Participante1234!");
  console.log("   Resp. ciclismo: ciclismo@demo.es / Ciclismo1234!  → /admin/eventos");
  console.log("   Microweb demo: /marcha-ciclista-bomberos");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
