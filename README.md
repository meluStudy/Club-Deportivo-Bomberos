# Club Deportivo Bomberos de Madrid · Web oficial

Web del **Club Agrupación Deportiva Atlética Bomberos de Madrid** (CIF G-79411666), con domicilio en el Parque de Bomberos nº 8, Calle Pío Felipe s/n, 28038 Madrid. Inspirada en los grandes clubes polideportivos: portada con actualidad, secciones deportivas, eventos con inscripción y pago, tienda oficial con control de stock, área de socios con cuota anual y renovación, panel de administración y páginas legales.

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions) + React 19 + TypeScript |
| Estilos | Tailwind CSS 4 · tipografías Barlow / Barlow Condensed · colores rojo `#e10600` y negro `#0b0b0d` |
| Animaciones | Framer Motion (transiciones de página, botones, aparición al hacer scroll, menú móvil, carrito) |
| Base de datos | PostgreSQL con Prisma ORM y migraciones versionadas (el mismo motor en desarrollo, pruebas y producción) |
| Autenticación | Sesiones JWT firmadas (jose) en cookie httpOnly · contraseñas con bcrypt · roles `ADMIN`, `SOCIO`, `PARTICIPANTE` |
| Pagos | Stripe Checkout + webhook. Sin claves de Stripe funciona en **modo demo** (pasarela simulada) |

## Puesta en marcha

Hace falta Node 20.9 o superior y un PostgreSQL en marcha (local o en Docker):

```bash
docker run -d --name cdb-postgres -e POSTGRES_PASSWORD=cdb -e POSTGRES_DB=cdb_dev -p 5432:5432 postgres:16

npm install
cp .env.example .env        # ajusta DATABASE_URL, AUTH_SECRET y el administrador
npm run db:migrate          # crea las tablas aplicando las migraciones
npm run db:seed             # carga secciones, noticias, eventos, productos y usuarios demo
npm run dev                 # http://localhost:3000
```

Usuarios de prueba creados por el seed:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@clubdeportivobomberos.es` (o `ADMIN_EMAIL` del `.env`) | `Admin1234!` |
| Socio con cuota activa | `socio@demo.es` | `Socio1234!` |
| Responsable de la sección de ciclismo | `ciclismo@demo.es` | `Ciclismo1234!` |
| Participante | `participante@demo.es` | `Participante1234!` |

Otros comandos: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run imagenes` (regenera las ilustraciones), `npm run db:studio` (explorador de datos), `npm run db:migrate` (crea una migración tras tocar el esquema), `npm run db:deploy` (aplica migraciones en el servidor) y `npm run db:reset` (borra y vuelve a sembrar).

## Mapa de la web

| Ruta | Contenido |
| --- | --- |
| `/` | Hero animado, últimas noticias, secciones, próximos eventos, cuotas de socio y productos destacados |
| `/secciones`, `/secciones/[slug]` | Las 10 secciones (atletismo, fútbol, rugby, ciclismo, natación, triatlón, montaña, pádel, baloncesto, CrossFit) con horarios, técnico, noticias y eventos propios |
| `/actualidad`, `/actualidad/[slug]` | Noticias con filtro por sección |
| `/eventos` | Calendario con plazas, precio general y de socio |
| `/nombre-evento`, `/nombre-evento/etapas`… | **Microweb de cada evento** con pestañas Inicio, Presentación, Alojamiento, Programa, Etapas (GPX, mapa y perfil), Inscripciones y Contacto. Las pestañas vacías no se muestran |
| `/tienda`, `/tienda/[slug]`, `/checkout` | Catálogo por categorías, tallas y colores con stock, carrito lateral, recogida o envío, pago |
| `/socios` | Ventajas, modalidades de cuota y alta online |
| `/cuenta` | Carné digital de socio, renovación de temporada, inscripciones y pedidos |
| `/admin/*` | Resumen, socios (con campaña de renovación), tienda y stock, pedidos, eventos con editor de microweb, noticias, mensajes, correos enviados y usuarios |
| `/recuperar-contrasena`, `/restablecer-contrasena` | Recuperación de contraseña |
| `/contacto` | Formulario, datos, redes sociales y mapa |
| `/legal/*` | Aviso legal, privacidad, cookies, términos y condiciones, envíos y devoluciones, estatutos |
| `/login`, `/registro` | Cuentas de usuario |

## Cuentas y seguridad

- **Recuperar contraseña**: desde la pantalla de acceso. Se envía un enlace de un solo uso que caduca en una hora; el token se guarda cifrado y nunca viaja en la base de datos en claro. Al cambiar la contraseña se levanta cualquier bloqueo por intentos fallidos.
- **Límite de intentos**: cinco fallos de acceso por cuenta (y veinte por dirección de red) bloquean temporalmente, con espera creciente de 15 minutos a 4 horas. También están limitados el alta de cuentas, el formulario de contacto, las solicitudes de recuperación y las subidas de imágenes.

## Correo saliente

Los avisos (recuperación de contraseña y campañas de renovación) se envían con **Resend** (`RESEND_API_KEY`) o por **SMTP** del propio dominio (`SMTP_URL`). Si no hay ninguno configurado, la web sigue funcionando: los mensajes se registran en `/admin/correos`, donde el administrador puede ver el contenido y los enlaces. Así se puede probar todo antes de contratar el correo.

## Listados en Excel

Desde el panel se descargan en CSV, con separador de punto y coma y acentos correctos para abrirlos directamente en Excel en español:

| Listado | Dónde |
| --- | --- |
| Inscritos de un evento (con los datos federativos) | Editor del evento → Inscritos |
| Socios de una temporada | Socios |
| Pedidos de la tienda | Pedidos y Tienda |
| Usuarios registrados | Usuarios |

## Roles y flujos

- **Participante**: se crea al registrarse. Puede inscribirse en eventos y comprar.
- **Socio**: al pagar la cuota anual el usuario pasa automáticamente a `SOCIO`, obtiene número de socio y carné digital, y se le aplican los precios de socio en tienda y eventos. La temporada es el año natural y la renovación se hace desde `/cuenta`.
- **Responsable de sección**: cualquier usuario al que el administrador asigne una sección desde *Usuarios*. Entra en `/admin` y solo ve *Eventos* y *Noticias* de su sección: puede crear noticias, crear eventos desde plantilla y rellenar la microweb del evento (etapas y GPX incluidos). No accede a stock, pedidos, socios ni mensajes.
- **Administrador**: acceso completo a `/admin`, incluido el stock de la tienda, el registro de correos y el HTML libre de las microwebs. Se puede promover a cualquier usuario desde *Usuarios*.

En *Socios* hay una **campaña de renovación**: localiza a los socios de la temporada en curso que aún no han renovado para la siguiente y les envía un aviso por correo, con la opción de escribir solo a quien no haya recibido ninguno todavía. Cada envío queda registrado en la ficha del socio y en `/admin/correos`.

## Microweb de eventos

Cada evento se publica en `/nombre-evento` con pestañas propias. Desde `/admin/eventos` se crea el evento eligiendo una plantilla (marcha ciclista por etapas, carrera popular o en blanco) y se abre el editor, que tiene una pestaña por sección de la microweb:

- **Ficha**: título, URL, fechas, lugar, precios, plazas, imágenes y publicación (borrador visible solo para el panel).
- **Inicio**: datos destacados (`Etiqueta | Valor`) y texto de bienvenida.
- **Presentación** y **Alojamiento**: texto en markdown sencillo; alojamientos recomendados en líneas `Nombre | Localidad | Precio | Contacto | Notas`.
- **Programa**: `## Título del día` seguido de líneas `Hora | Qué | Punto de encuentro | Notas`.
- **Etapas**: una o varias etapas con fecha, salida, llegada, descripción, horario (`Hora | Qué | Lugar`) y archivo GPX. Al subir el GPX la web calcula distancia y desnivel, dibuja el mapa (OpenStreetMap) y el perfil de altimetría y ofrece la descarga. El lector de GPX admite los archivos que exportan Garmin, Strava, Wikiloc y similares: atributos en cualquier orden, espacios de nombres, etiquetas autocerradas, extensiones y varios tramos por pista.
- **Inscripciones**: texto informativo; el panel de inscripción y pago se genera solo.
- **Modalidades**: cada tipo de inscripción con su nombre, descripción, precio, precio de socio y plazas propias (por ejemplo *Marcha completa*, *Solo etapa 1*, *Acompañante*). Incluye el recuento de inscritos, las plazas ocupadas y lo recaudado por cada modalidad. Si no se crea ninguna, se usa el precio de la ficha del evento.
- **Contacto**: persona, correo y teléfono de la organización.
- **Inscritos**: listado con estado de pago, datos del participante y observaciones, descargable en Excel.

En la pestaña de **Inscripciones** se elige además qué datos pide la organización a cada participante: DNI, fecha de nacimiento, talla, club de procedencia, número de licencia federativa, contacto de emergencia y notas médicas. Se piden en el formulario, se guardan en la cuenta del participante para no volver a pedírselos, salen en el listado del panel y en el Excel.

Las pestañas sin contenido no aparecen en la web pública. Los administradores globales pueden además añadir HTML libre al final de cada pestaña.

## Pagos con Stripe

1. Crea una cuenta en Stripe y copia las claves en `.env` (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
2. Configura un webhook apuntando a `https://tu-dominio/api/webhooks/stripe` con los eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` y `checkout.session.expired`. Copia el secreto en `STRIPE_WEBHOOK_SECRET`.
3. En local puedes usar `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

Sin claves, todos los cobros (cuotas, inscripciones y pedidos) pasan por `/pago/demo`, una pantalla que simula el resultado del pago. Es útil para probar, pero **no debe usarse en producción**.

## Identidad de marca

El logotipo del club se ha **vectorizado a partir del archivo original** (`public/images/marca/logo-original.jpg`, un JPEG de 296 × 170 px con el fondo aplanado a negro). El resultado es nítido a cualquier tamaño y pesa lo mismo en una tarjeta de visita que en una valla.

| Archivo | Uso |
| --- | --- |
| `public/images/marca/logo.svg` | Logotipo completo para fondos claros (cabecera, documentos) |
| `public/images/marca/logo-inverso.svg` | Logotipo completo para fondos oscuros (pie de página, portadas) |
| `public/images/marca/isotipo.svg` | Solo el corredor y la pista, sin tipografía |
| `public/images/marca/isotipo-inverso.svg` | Isotipo para fondos oscuros |
| `public/images/marca/icono.svg` | Icono de aplicación (mismo dibujo que el favicon) |
| `public/images/marca/logo-original.jpg` | Archivo original recibido, guardado como referencia |

Colores corporativos: rojo `#e10600`, negro `#0b0b0d` y azul del corredor `#131a8a`.

### Favicon

El logotipo completo no se lee a 16 píxeles, así que el favicon es una **adaptación**: pictograma del corredor en blanco sobre negro con la pista en rojo. Se sirve en todos los formatos que piden los navegadores y Google:

| Archivo | Tamaño | Para qué |
| --- | --- | --- |
| `public/favicon.ico` | 16, 32 y 48 px | El que Google busca en la raíz del dominio para los resultados de búsqueda |
| `public/icon.svg` | vectorial | Pestañas del navegador en pantallas de alta densidad |
| `public/icon-192.png`, `public/icon-512.png` | 192 y 512 px | Instalación como aplicación y buscadores |
| `public/icon-maskable-512.png` | 512 px | Icono adaptable de Android (con margen de recorte) |
| `public/apple-icon.png` | 180 px | Pantalla de inicio de iPhone y iPad |
| `public/images/og.png` | 1200 × 630 px | Vista previa al compartir el enlace en redes y WhatsApp |

Para que el favicon salga en Google hace falta, además de los archivos: que el dominio esté publicado y accesible, que la web esté indexada y que la etiqueta `<link rel="icon">` apunte a una URL estable. Todo eso ya está en `src/app/layout.tsx`, junto con los datos estructurados de `src/components/structured-data.tsx` (ficha `SportsOrganization` con el nombre legal, el CIF, la dirección y el logotipo). Google puede tardar entre unos días y varias semanas en actualizarlo tras la publicación.

## Imágenes subidas desde el panel

Los formularios de eventos, noticias y productos permiten arrastrar una imagen o elegirla del disco. Se recorta a 2000 píxeles como máximo, se convierte a WebP y se guarda en la carpeta `uploads/` (fuera de `public/`, para que sobreviva a los despliegues). Se sirven por la ruta `/media`. En producción conviene apuntar `UPLOADS_DIR` a un disco persistente, por ejemplo `/var/www/cdb/uploads`. En plataformas sin disco (Vercel y similares) hay que cambiar la escritura por un almacenamiento externo tipo S3 o R2: solo cambia el final de `src/app/api/uploads/route.ts`.

### Ilustraciones provisionales

Mientras no haya fotografías reales, la web usa ilustraciones generadas con la identidad del club: fondo oscuro con degradado, banda roja diagonal y el pictograma del deporte correspondiente. Se generan con:

```bash
npm run imagenes
```

El script está en `scripts/generar-imagenes.ts` y los pictogramas en `src/lib/pictogramas.ts` (los mismos que se usan en los iconos de sección de la web, para mantener un único trazo). Para sustituirlas por fotos reales basta con reemplazar los archivos:

- Portada: `public/images/hero.svg`.
- Secciones: `public/images/sections/<slug>.svg` (puede ser `.jpg`/`.png` cambiando la ruta desde el seed o el panel).
- Noticias, eventos y productos: se editan desde el panel indicando la ruta o URL de la imagen.

## Despliegue

La guía completa, con los dos entornos (pruebas y producción), el servidor, las
bases de datos, las copias de seguridad y el flujo de trabajo, está en
**[DESPLIEGUE.md](DESPLIEGUE.md)**.

En resumen: cualquier servidor con Node 20.9+, PostgreSQL y un disco persistente
para `UPLOADS_DIR`. El arranque en el servidor es `npm run db:deploy && npm start`.

## Estructura

```
prisma/          esquema, migraciones y seed
src/app/         rutas (App Router)
src/actions/     server actions: auth, socios, eventos, tienda, admin, contacto
src/lib/         prisma, auth, correo, límite de intentos, pagos, stripe, datos, CSV, validaciones, textos legales, config del sitio
scripts/         generador de las ilustraciones
src/components/  UI, layout (cabecera, footer, cookies), carrito, tienda, admin
public/images/   logo y marcadores de posición
```
