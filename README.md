# Club Deportivo Bomberos Madrid · Web oficial

Web moderna del Club Deportivo Bomberos Madrid, inspirada en los grandes clubes polideportivos: portada con actualidad, secciones deportivas, eventos con inscripción y pago, tienda oficial con control de stock, área de socios con cuota anual y renovación, panel de administración y páginas legales.

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions) + React 19 + TypeScript |
| Estilos | Tailwind CSS 4 · tipografías Barlow / Barlow Condensed · colores rojo `#e10600` y negro `#0b0b0d` |
| Animaciones | Framer Motion (transiciones de página, botones, aparición al hacer scroll, menú móvil, carrito) |
| Base de datos | Prisma ORM · SQLite en desarrollo · PostgreSQL en producción cambiando el `provider` |
| Autenticación | Sesiones JWT firmadas (jose) en cookie httpOnly · contraseñas con bcrypt · roles `ADMIN`, `SOCIO`, `PARTICIPANTE` |
| Pagos | Stripe Checkout + webhook. Sin claves de Stripe funciona en **modo demo** (pasarela simulada) |

## Puesta en marcha

```bash
npm install
cp .env.example .env        # revisa AUTH_SECRET y las credenciales del admin
npm run db:push             # crea la base de datos
npm run db:seed             # carga secciones, noticias, eventos, productos y usuarios demo
npm run dev                 # http://localhost:3000
```

Usuarios de prueba creados por el seed:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@cdbomberosmadrid.es` (o `ADMIN_EMAIL` del `.env`) | `Admin1234!` |
| Socio con cuota activa | `socio@demo.es` | `Socio1234!` |
| Responsable de la sección de ciclismo | `ciclismo@demo.es` | `Ciclismo1234!` |
| Participante | `participante@demo.es` | `Participante1234!` |

Otros comandos: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run db:studio` (explorador de datos), `npm run db:reset` (borra y vuelve a sembrar).

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
| `/admin/*` | Resumen (recuento de socios por modalidad, ingresos, stock bajo), socios, tienda y stock, pedidos, eventos con editor de microweb e inscritos, noticias, mensajes y usuarios |
| `/contacto` | Formulario, datos, redes sociales y mapa |
| `/legal/*` | Aviso legal, privacidad, cookies, términos y condiciones, envíos y devoluciones, estatutos |
| `/login`, `/registro` | Cuentas de usuario |

## Roles y flujos

- **Participante**: se crea al registrarse. Puede inscribirse en eventos y comprar.
- **Socio**: al pagar la cuota anual el usuario pasa automáticamente a `SOCIO`, obtiene número de socio y carné digital, y se le aplican los precios de socio en tienda y eventos. La temporada es el año natural y la renovación se hace desde `/cuenta`.
- **Responsable de sección**: cualquier usuario al que el administrador asigne una sección desde *Usuarios*. Entra en `/admin` y solo ve *Eventos* y *Noticias* de su sección: puede crear noticias, crear eventos desde plantilla y rellenar la microweb del evento (etapas y GPX incluidos). No accede a stock, pedidos, socios ni mensajes.
- **Administrador**: acceso completo a `/admin`, incluido el stock de la tienda y el HTML libre de las microwebs. Se puede promover a cualquier usuario desde *Usuarios*.

## Microweb de eventos

Cada evento se publica en `/nombre-evento` con pestañas propias. Desde `/admin/eventos` se crea el evento eligiendo una plantilla (marcha ciclista por etapas, carrera popular o en blanco) y se abre el editor, que tiene una pestaña por sección de la microweb:

- **Ficha**: título, URL, fechas, lugar, precios, plazas, imágenes y publicación (borrador visible solo para el panel).
- **Inicio**: datos destacados (`Etiqueta | Valor`) y texto de bienvenida.
- **Presentación** y **Alojamiento**: texto en markdown sencillo; alojamientos recomendados en líneas `Nombre | Localidad | Precio | Contacto | Notas`.
- **Programa**: `## Título del día` seguido de líneas `Hora | Qué | Punto de encuentro | Notas`.
- **Etapas**: una o varias etapas con fecha, salida, llegada, descripción, horario (`Hora | Qué | Lugar`) y archivo GPX. Al subir el GPX la web calcula distancia y desnivel, dibuja el mapa (OpenStreetMap) y el perfil de altimetría y ofrece la descarga.
- **Inscripciones**: texto informativo; el panel de inscripción y pago se genera con los precios de la ficha.
- **Contacto**: persona, correo y teléfono de la organización.
- **Inscritos**: listado con estado de pago y observaciones.

Las pestañas sin contenido no aparecen en la web pública. Los administradores globales pueden además añadir HTML libre al final de cada pestaña.

## Pagos con Stripe

1. Crea una cuenta en Stripe y copia las claves en `.env` (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
2. Configura un webhook apuntando a `https://tu-dominio/api/webhooks/stripe` con los eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` y `checkout.session.expired`. Copia el secreto en `STRIPE_WEBHOOK_SECRET`.
3. En local puedes usar `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

Sin claves, todos los cobros (cuotas, inscripciones y pedidos) pasan por `/pago/demo`, una pantalla que simula el resultado del pago. Es útil para probar, pero **no debe usarse en producción**.

## Logos e imágenes

Las imágenes actuales son marcadores de posición en SVG. Para sustituirlas:

- Escudo del club: `public/images/logo.svg` (se usa en cabecera, footer y páginas de acceso).
- Portada: `public/images/hero.svg`.
- Secciones: `public/images/sections/<slug>.svg` (puede ser `.jpg`/`.png` cambiando la ruta desde el seed o el panel).
- Noticias, eventos y productos: se editan desde el panel de administración indicando la ruta o URL de la imagen.

## Despliegue

- **Vercel / Netlify / Railway**: `npm run build` ejecuta `prisma generate` y `next build`.
- Para producción cambia `datasource db { provider = "postgresql" }` en `prisma/schema.prisma`, apunta `DATABASE_URL` a la base de datos y ejecuta `npm run db:migrate` (o `db:push`) y `npm run db:seed`.
- Define `NEXT_PUBLIC_SITE_URL`, un `AUTH_SECRET` largo y aleatorio, y las claves de Stripe.

## Estructura

```
prisma/          esquema y seed
src/app/         rutas (App Router)
src/actions/     server actions: auth, socios, eventos, tienda, admin, contacto
src/lib/         prisma, auth, pagos, stripe, datos, validaciones, textos legales, config del sitio
src/components/  UI, layout (cabecera, footer, cookies), carrito, tienda, admin
public/images/   logo y marcadores de posición
```
