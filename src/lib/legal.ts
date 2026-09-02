import { site } from "./site";

export type LegalPage = { slug: string; title: string; updated: string; content: string };

const responsable = `**Responsable:** ${site.name}, CIF ${site.cif}, ${site.address}. Correo: ${site.email}.`;

export const legalPages: LegalPage[] = [
  {
    slug: "aviso-legal",
    title: "Aviso legal",
    updated: "1 de enero de 2026",
    content: `## 1. Datos identificativos

En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que el titular de este sitio web es:

${responsable}

Entidad deportiva sin ánimo de lucro inscrita en el Registro de Entidades Deportivas de la Comunidad de Madrid.

## 2. Objeto

El presente aviso legal regula el uso del sitio web ${site.url} (en adelante, "la web"), que el club pone a disposición de los usuarios de Internet. El acceso a la web atribuye la condición de usuario e implica la aceptación plena de todas las condiciones incluidas en este aviso legal.

## 3. Condiciones de uso

El usuario se compromete a hacer un uso adecuado de los contenidos y servicios de la web y a no emplearlos para realizar actividades ilícitas o contrarias a la buena fe, difundir contenidos de carácter racista, xenófobo o discriminatorio, provocar daños en los sistemas físicos y lógicos del club o de terceros, ni intentar acceder a cuentas de otros usuarios.

## 4. Propiedad intelectual e industrial

Todos los contenidos de la web (textos, fotografías, gráficos, imágenes, iconos, escudos, logotipos, software y demás) son propiedad del club o de terceros que han autorizado su uso. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa. El escudo y la denominación del Cuerpo de Bomberos del Ayuntamiento de Madrid se utilizan con autorización.

## 5. Exclusión de garantías y responsabilidad

El club no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran derivarse de errores u omisiones en los contenidos, de la falta de disponibilidad de la web o de la transmisión de virus o programas maliciosos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.

## 6. Enlaces

La web puede contener enlaces a sitios de terceros. El club no ejerce control sobre dichos sitios y no asume responsabilidad alguna por sus contenidos.

## 7. Legislación aplicable

La relación entre el club y el usuario se regirá por la normativa española vigente. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de Madrid capital, salvo que la normativa de consumidores establezca otro fuero.`,
  },
  {
    slug: "privacidad",
    title: "Política de privacidad",
    updated: "1 de enero de 2026",
    content: `## 1. Responsable del tratamiento

${responsable}

## 2. Finalidades y base jurídica

Tratamos tus datos personales para las siguientes finalidades:

- **Gestión de socios:** alta, renovación, emisión del carné, cobro de cuotas y comunicaciones propias de la condición de socio. Base jurídica: ejecución de la relación asociativa (art. 6.1.b RGPD) y obligaciones legales.
- **Inscripción en eventos:** gestión de tu participación, seguro deportivo, dorsales y clasificaciones. Base jurídica: ejecución del contrato (art. 6.1.b RGPD).
- **Tienda oficial:** tramitación, pago y envío de pedidos, facturación y atención de devoluciones. Base jurídica: ejecución del contrato y obligaciones legales (fiscales y de consumo).
- **Cuenta de usuario:** creación y mantenimiento de tu cuenta en la web. Base jurídica: ejecución del contrato.
- **Formulario de contacto:** atención de consultas. Base jurídica: consentimiento (art. 6.1.a RGPD).
- **Comunicaciones informativas del club:** boletín y novedades, solo si nos lo autorizas. Base jurídica: consentimiento.

## 3. Datos tratados

Datos identificativos (nombre, apellidos, DNI), de contacto (correo, teléfono, dirección), fecha de nacimiento, condición de bombero, datos de pago (tratados directamente por la pasarela de pago; el club no almacena números de tarjeta) y, en su caso, datos de salud estrictamente necesarios para la práctica deportiva (alergias o condiciones indicadas voluntariamente en las inscripciones).

## 4. Conservación

Los datos se conservarán mientras se mantenga la relación asociativa o contractual y, posteriormente, durante los plazos de prescripción de las obligaciones legales (con carácter general, 5 años en materia fiscal y de consumo).

## 5. Destinatarios

No se cederán datos a terceros salvo obligación legal. Acceden a los datos como encargados de tratamiento: la pasarela de pago (Stripe Payments Europe, Ltd.), el proveedor de alojamiento web, la compañía aseguradora del seguro deportivo y las federaciones deportivas cuando sea necesario para la tramitación de licencias. Las transferencias internacionales, cuando existan, se amparan en cláusulas contractuales tipo o decisiones de adecuación de la Comisión Europea.

## 6. Derechos

Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a ${site.email} o por correo postal a la dirección indicada, acompañando copia de tu documento de identidad. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).

## 7. Menores

La inscripción de menores de 14 años debe realizarla su padre, madre o tutor legal.

## 8. Seguridad

Aplicamos medidas técnicas y organizativas adecuadas para garantizar la seguridad de los datos, incluyendo cifrado de las comunicaciones (HTTPS), almacenamiento cifrado de contraseñas y control de accesos por roles.`,
  },
  {
    slug: "cookies",
    title: "Política de cookies",
    updated: "1 de enero de 2026",
    content: `## ¿Qué son las cookies?

Una cookie es un pequeño archivo que se descarga en tu dispositivo al acceder a determinadas páginas web y que permite, entre otras cosas, almacenar y recuperar información sobre tus hábitos de navegación.

## Cookies que utiliza esta web

- **Cookies técnicas (esenciales):** necesarias para el funcionamiento de la web. Incluyen la cookie de sesión de usuario (cdb_session), el carrito de compra y la preferencia sobre cookies. No requieren consentimiento.
- **Cookies de la pasarela de pago:** Stripe utiliza cookies para la prevención del fraude durante el proceso de pago.
- **Cookies analíticas (opcionales):** solo se instalarán si las aceptas expresamente en el aviso de cookies. Permiten conocer el uso de la web para mejorarla.
- **Cookies de terceros:** los contenidos incrustados (mapas, vídeos) pueden instalar cookies propias de esos servicios.

## Cómo gestionar las cookies

Puedes aceptar solo las cookies esenciales desde el aviso que aparece al entrar en la web. Además, puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que bloquear las cookies técnicas puede impedir el correcto funcionamiento de la web (inicio de sesión, carrito, pagos).

## Actualizaciones

Esta política puede actualizarse en función de exigencias legislativas o cambios en la web. Te recomendamos revisarla periódicamente.`,
  },
  {
    slug: "terminos",
    title: "Términos y condiciones",
    updated: "1 de enero de 2026",
    content: `## 1. Ámbito

Estas condiciones regulan la compra de productos en la tienda oficial, la inscripción en eventos y el alta y renovación como socio a través de ${site.url}. ${responsable}

## 2. Cuenta de usuario

Para hacerte socio, inscribirte en eventos o consultar tus pedidos necesitas crear una cuenta. Eres responsable de la veracidad de los datos y de la custodia de tu contraseña. El club podrá suspender cuentas que incumplan estas condiciones.

## 3. Cuotas de socio

- La cuota es **anual** y corresponde a la temporada natural (1 de enero a 31 de diciembre), con independencia de la fecha de alta.
- El alta se formaliza con el pago de la cuota. La Junta Directiva puede denegar motivadamente la admisión conforme a los estatutos.
- La cuota **no es reembolsable** salvo error en el cobro o imposibilidad del club de prestar los servicios.
- La renovación no es automática: el socio deberá renovar desde su área personal.

## 4. Inscripción en eventos

- La inscripción queda confirmada al completar el pago. Las plazas son limitadas y se asignan por orden de pago.
- Cancelaciones: se devolverá el 100% si se solicita con más de 15 días de antelación al evento, el 50% entre 15 y 7 días, y no habrá devolución en los 7 días previos, salvo causa médica justificada.
- Si el club cancela el evento, se reembolsará el importe íntegro.
- El participante declara encontrarse en condiciones físicas adecuadas y acepta el reglamento específico de cada prueba.

## 5. Tienda oficial

- Los precios se indican en euros con IVA incluido. Los precios de socio se aplican automáticamente a las cuentas con cuota activa.
- El pedido se confirma al completar el pago. El stock se reserva en ese momento.
- Entrega: recogida gratuita en la secretaría del club o envío a domicilio (península) con el coste indicado en el proceso de compra, en un plazo de 2 a 4 días laborables desde la preparación.
- Consulta la política de envíos y devoluciones para desistimiento y cambios.

## 6. Pago

Los pagos se procesan a través de la pasarela Stripe mediante tarjeta de crédito o débito. El club no almacena datos de tarjetas. Recibirás un justificante por correo electrónico.

## 7. Derechos de imagen

Durante los eventos del club pueden tomarse fotografías y vídeos con fines informativos y de difusión en la web y redes sociales del club. Puedes oponerte escribiendo a ${site.email}.

## 8. Legislación y reclamaciones

Estas condiciones se rigen por la legislación española. Puedes acudir a la plataforma europea de resolución de litigios en línea: https://ec.europa.eu/consumers/odr.`,
  },
  {
    slug: "devoluciones",
    title: "Envíos y devoluciones",
    updated: "1 de enero de 2026",
    content: `## Envíos

- **Recogida en el club:** gratuita. Te avisaremos por correo cuando tu pedido esté listo en la secretaría del Parque Central de Bomberos (lunes a viernes, 17:00 - 20:00).
- **Envío a domicilio:** 4,95 € para península. Plazo de entrega de 2 a 4 días laborables desde la preparación del pedido. Consulta envíos a Baleares, Canarias, Ceuta y Melilla escribiendo a ${site.email}.

## Derecho de desistimiento

Dispones de **14 días naturales** desde la recepción del pedido para desistir sin necesidad de justificación, conforme al Real Decreto Legislativo 1/2007. Los productos deben devolverse sin usar, con etiquetas y embalaje original. Los gastos de devolución corren a cargo del cliente salvo producto defectuoso o error del club.

Quedan excluidos del desistimiento los productos personalizados (nombre, dorsal) y los precintados por razones de higiene que hayan sido desprecintados.

## Cambios de talla

Puedes cambiar la talla en la secretaría del club de forma gratuita, sujeto a disponibilidad de stock, dentro de los 30 días siguientes a la compra.

## Productos defectuosos

Los productos tienen la garantía legal de 3 años. Si recibes un producto defectuoso, escríbenos a ${site.email} con fotografías y el número de pedido y gestionaremos la sustitución o el reembolso.

## Reembolsos

Los reembolsos se realizan por el mismo medio de pago en un plazo máximo de 14 días desde la recepción del producto devuelto.`,
  },
  {
    slug: "estatutos",
    title: "Estatutos del club",
    updated: "Aprobados en Asamblea General",
    content: `## Capítulo I. Denominación, fines y domicilio

**Artículo 1.** El ${site.name} es una entidad deportiva sin ánimo de lucro constituida al amparo de la Ley 15/1994, de 28 de diciembre, del Deporte de la Comunidad de Madrid.

**Artículo 2.** Son fines del club el fomento y la práctica de la actividad física y deportiva entre los miembros del Cuerpo de Bomberos del Ayuntamiento de Madrid, sus familiares y la ciudadanía en general, así como la promoción de los valores de compañerismo, esfuerzo y servicio público.

**Artículo 3.** El domicilio social se fija en ${site.address}.

## Capítulo II. Socios

**Artículo 4.** Podrán ser socios las personas mayores de edad que lo soliciten y sean admitidas por la Junta Directiva, en las modalidades de socio bombero, socio familiar y socio simpatizante.

**Artículo 5.** Son derechos de los socios participar en las actividades del club, asistir con voz y voto a la Asamblea General, ser electores y elegibles para los órganos de gobierno y recibir información sobre la marcha del club.

**Artículo 6.** Son deberes de los socios abonar las cuotas establecidas, cumplir los estatutos y los acuerdos de los órganos de gobierno y contribuir al buen nombre del club.

**Artículo 7.** La condición de socio se pierde por baja voluntaria, impago de la cuota o expulsión acordada por la Junta Directiva previo expediente disciplinario.

## Capítulo III. Órganos de gobierno

**Artículo 8.** Son órganos de gobierno la Asamblea General y la Junta Directiva.

**Artículo 9.** La Asamblea General es el órgano supremo del club, se reunirá con carácter ordinario una vez al año y aprobará las cuentas, el presupuesto y el plan deportivo.

**Artículo 10.** La Junta Directiva estará formada por presidencia, vicepresidencia, secretaría, tesorería y las vocalías de cada sección deportiva. Su mandato será de cuatro años.

## Capítulo IV. Secciones deportivas

**Artículo 11.** El club se organiza en secciones deportivas, cada una con un vocal responsable. La creación o supresión de secciones corresponde a la Asamblea General.

## Capítulo V. Régimen económico

**Artículo 12.** Los recursos del club proceden de las cuotas de socios, ingresos por actividades y eventos, venta de productos oficiales, subvenciones, patrocinios y donaciones.

**Artículo 13.** El ejercicio económico coincide con el año natural.

## Capítulo VI. Disolución

**Artículo 14.** El club se disolverá por acuerdo de la Asamblea General Extraordinaria adoptado por dos tercios de los socios. El patrimonio resultante se destinará a fines deportivos o benéficos vinculados al Cuerpo de Bomberos de Madrid.

> El texto íntegro y oficial de los estatutos puede consultarse en la secretaría del club.`,
  },
];

export const getLegalPage = (slug: string) => legalPages.find((p) => p.slug === slug);
