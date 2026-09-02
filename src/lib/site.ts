export const site = {
  /** Nombre comercial, el que aparece en el logotipo. */
  name: "Club Deportivo Bomberos de Madrid",
  shortName: "CD Bomberos de Madrid",
  /** Denominación oficial inscrita en el registro de entidades deportivas. */
  legalName: "Club Agrupación Deportiva Atlética Bomberos de Madrid",
  description:
    "Club Agrupación Deportiva Atlética Bomberos de Madrid. Atletismo, fútbol, rugby, ciclismo, natación y muchas más secciones. Noticias, eventos, tienda oficial y área de socios.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "info@clubdeportivobomberos.es",
  address: {
    line: "Parque de Bomberos nº 8, Calle Pío Felipe s/n",
    postalCode: "28038",
    city: "Madrid",
    country: "España",
    /** Coordenadas aproximadas de la calle Pío Felipe (Puente de Vallecas). */
    lat: 40.3879,
    lng: -3.6534,
  },
  cif: "G-79411666",
  social: {
    instagram: "https://www.instagram.com/clubdeportivobomberosmadrid",
    facebook: "https://www.facebook.com/profile.php?id=100065233671146",
  },
  socialHandles: {
    instagram: "@clubdeportivobomberosmadrid",
    facebook: "Club Deportivo Bomberos Madrid",
  },
  founded: 1985,
};

/** Dirección en una línea, para pies de página y textos legales. */
export const fullAddress = `${site.address.line}, ${site.address.postalCode} ${site.address.city}`;

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
