export const site = {
  name: "Club Deportivo Bomberos Madrid",
  shortName: "CD Bomberos Madrid",
  description:
    "Club deportivo del Cuerpo de Bomberos del Ayuntamiento de Madrid. Atletismo, fútbol, rugby, ciclismo, natación y muchas más secciones. Noticias, eventos, tienda oficial y área de socios.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "info@cdbomberosmadrid.es",
  phone: "+34 900 000 000",
  address: "Parque Central de Bomberos, C/ Imperial 10, 28005 Madrid",
  cif: "G-00000000",
  social: {
    instagram: "https://instagram.com/cdbomberosmadrid",
    twitter: "https://x.com/cdbomberosmadrid",
    facebook: "https://facebook.com/cdbomberosmadrid",
    youtube: "https://youtube.com/@cdbomberosmadrid",
    tiktok: "https://tiktok.com/@cdbomberosmadrid",
  },
  founded: 1985,
};

export const mainNav = [
  { href: "/", label: "Inicio" },
  { href: "/secciones", label: "Secciones" },
  { href: "/actualidad", label: "Actualidad" },
  { href: "/eventos", label: "Eventos" },
  { href: "/tienda", label: "Tienda oficial" },
  { href: "/socios", label: "Socios" },
  { href: "/contacto", label: "Contacto" },
];

export const legalNav = [
  { href: "/legal/aviso-legal", label: "Aviso legal" },
  { href: "/legal/privacidad", label: "Política de privacidad" },
  { href: "/legal/cookies", label: "Política de cookies" },
  { href: "/legal/terminos", label: "Términos y condiciones" },
  { href: "/legal/devoluciones", label: "Envíos y devoluciones" },
  { href: "/legal/estatutos", label: "Estatutos del club" },
];
