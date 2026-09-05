import { site } from "./site";

/**
 * Modo demostración: para enseñar la web antes de publicarla de verdad.
 * Se activa con DEMO_MODE=1 y añade un aviso permanente y una página con las
 * cuentas de prueba. En producción se deja apagado.
 */
export const modoDemo = () => process.env.DEMO_MODE === "1";

export type CuentaDemo = {
  rol: string;
  email: string;
  password: string;
  descripcion: string;
  entrar: string;
};

export const cuentasDemo: CuentaDemo[] = [
  {
    rol: "Administrador del club",
    email: process.env.ADMIN_EMAIL ?? "admin@clubdeportivobomberos.es",
    password: process.env.ADMIN_PASSWORD ?? "Admin1234!",
    descripcion:
      "Ve todo el panel: recuento de socios, ingresos, stock de la tienda, pedidos, eventos, noticias, mensajes, correos enviados y usuarios.",
    entrar: "/admin",
  },
  {
    rol: "Responsable de sección (ciclismo)",
    email: "ciclismo@demo.es",
    password: "Ciclismo1234!",
    descripcion:
      "Solo gestiona su sección: crea eventos desde plantilla, rellena la microweb, sube los GPX de las etapas y publica noticias de ciclismo.",
    entrar: "/admin/eventos",
  },
  {
    rol: "Socio con cuota al día",
    email: "socio@demo.es",
    password: "Socio1234!",
    descripcion: "Tiene carné digital con número de socio y se le aplican los precios reducidos en la tienda y en los eventos.",
    entrar: "/cuenta",
  },
  {
    rol: "Participante",
    email: "participante@demo.es",
    password: "Participante1234!",
    descripcion: "Cuenta normal, sin cuota. Sirve para ver la diferencia de precios y el proceso de hacerse socio.",
    entrar: "/socios",
  },
];

export const recorridoDemo = [
  {
    titulo: "La microweb de un evento",
    texto: `Entra en ${site.url.replace(/^https?:\/\//, "")}/marcha-ciclista-bomberos. Tiene sus propias pestañas: inicio, presentación, alojamiento, programa día a día, etapas con mapa y perfil de altimetría, inscripciones y contacto.`,
    enlace: "/marcha-ciclista-bomberos",
  },
  {
    titulo: "Inscribirse en una prueba",
    texto: "Accede como socio, elige una de las cuatro modalidades y verás cómo cambia el precio. Pide los datos federativos y al pagar aparece la pasarela simulada.",
    enlace: "/marcha-ciclista-bomberos/inscripciones",
  },
  {
    titulo: "Comprar en la tienda",
    texto: "Añade una camiseta al carrito eligiendo talla. Con la cuenta de socio el precio baja solo. El pago es simulado y el stock se descuenta de verdad.",
    enlace: "/tienda",
  },
  {
    titulo: "Hacerse socio",
    texto: "Con la cuenta de participante, elige una modalidad de cuota. Al completar el pago simulado se convierte en socio y aparece su carné.",
    enlace: "/socios",
  },
  {
    titulo: "El panel del club",
    texto: "Con la cuenta de administrador: recuento de socios, inscritos por modalidad, descarga de listados para Excel, subida de imágenes y campaña de renovación.",
    enlace: "/admin",
  },
];
