# Nueva web del Club Deportivo Bomberos de Madrid

**Estado actual y próximos pasos** · Septiembre de 2026

Demo: **https://club-deportivo-bomberos.vercel.app**
Cuentas de prueba y recorrido guiado: **https://club-deportivo-bomberos.vercel.app/demo**

---

## En una frase

La web está terminada en lo funcional: noticias, secciones, eventos con inscripción y pago, tienda con stock, área de socios con cuota anual y panel de administración. Para publicarla falta sobre todo material del club (fotos, textos, correos reales, datos de pago) y contratar el alojamiento definitivo.

## Sobre la demo

- **Es una versión de pruebas.** Los pagos son simulados: al pagar se abre una pantalla para simular un pago correcto o uno cancelado. No se cobra nada.
- **Los contenidos son de ejemplo.** Las noticias, entrenadores, horarios, resultados, eventos, precios, productos y cifras de la portada (socios, eventos al año, año de fundación) son ilustrativos y habrá que sustituirlos por los reales.
- **Las imágenes son ilustraciones provisionales** hechas para la web, a la espera de fotos del club.
- **Los correos no se envían todavía.** Quedan guardados en el panel de administración (apartado *Correos*) para poder ver qué habría recibido cada persona.
- Todo lo que se haga en la demo (inscripciones, pedidos, cuentas) se borrará antes de publicar.

---

## Qué tiene la web hoy

### Parte pública

| Apartado | Qué incluye |
|---|---|
| **Inicio** | Portada con el nombre del club, cifras, noticias destacadas, secciones, próximos eventos, tienda y llamada a hacerse socio. |
| **Secciones** | Las 10 secciones (atletismo, fútbol, rugby, ciclismo, natación, triatlón, montaña y escalada, pádel, baloncesto y CrossFit). Cada una con su página: descripción, responsable, horarios y lugares de entrenamiento, noticias y eventos propios. |
| **Actualidad** | Noticias del club, filtrables por sección. |
| **Eventos** | Próximos eventos del club, cada uno con su propia microweb (ver más abajo). |
| **Tienda oficial** | Catálogo con tallas y colores, stock por talla, carrito, precio de socio automático, envío a domicilio o recogida en el club, y pago. |
| **Socios** | Tipos de cuota (bombero, familiar, simpatizante) con sus ventajas, y alta o renovación con pago de la cuota anual. |
| **Contacto** | Formulario, correo, ubicación en el Parque de Bomberos nº 8 con mapa, e Instagram y Facebook del club. |
| **Pie de página** | Datos legales del club (denominación, CIF, domicilio), redes, enlaces a todas las secciones y a las páginas legales. |
| **Páginas legales** | Aviso legal, privacidad, cookies, condiciones de uso, devoluciones y estatutos. Hay aviso de cookies con opción de aceptar o rechazar. |

### Microweb de cada evento

Cada evento tiene su propia dirección, por ejemplo `clubdeportivobomberos.es/marcha-ciclista-bomberos`, con pestañas:

- **Inicio**: portada del evento, fecha, lugar, plazas y botón de inscripción.
- **Presentación**: texto libre.
- **Alojamiento**: hoteles o albergues recomendados.
- **Programa**: horario día a día con puntos de encuentro.
- **Etapas**: cada etapa con su GPX, mapa del recorrido, perfil de altimetría, distancia, desnivel, horarios y descarga del GPX para el GPS.
- **Inscripciones**: modalidades con su precio (por ejemplo, marcha completa, una etapa o acompañante), precio de socio, plazas por modalidad y pago en la propia web.
- **Contacto**: responsable del evento.

Las pestañas que se dejan vacías no aparecen. Hay plantillas para empezar rápido: *marcha ciclista*, *carrera* y *en blanco*. La **Marcha Ciclista Bomberos** ya está montada de ejemplo, con dos etapas y cuatro modalidades.

En cada evento se pueden pedir datos del participante: DNI, fecha de nacimiento, talla, club, licencia federativa, contacto de emergencia y notas médicas. La organización elige cuáles son obligatorios. Se guardan en la cuenta del participante para no tener que repetirlos en la siguiente prueba.

### Cuentas de usuario

| Tipo de cuenta | Qué puede hacer |
|---|---|
| **Participante** | Inscribirse en eventos, comprar en la tienda y ver sus inscripciones y pedidos. |
| **Socio** | Lo mismo, más su carné de socio con número y temporada, precios de socio en tienda y eventos, y renovación de la cuota. |
| **Responsable de sección** | Crear y editar noticias y eventos **solo de su sección**. Por ejemplo, el responsable de ciclismo gestiona la Marcha Ciclista. |
| **Administrador** | Todo. |

Todas las cuentas pueden **recuperar la contraseña** por correo. El acceso se bloquea temporalmente tras varios intentos fallidos, para evitar que alguien pruebe contraseñas.

### Panel de administración

- **Resumen**: ingresos por concepto, socios por tipo de cuota, pedidos, usuarios, próximos eventos y productos con poco stock.
- **Socios**: listado por temporada, número de socios y **aviso de renovación en bloque** por correo a quien no haya renovado.
- **Tienda y stock**: productos, precios, precio de socio, tallas, colores y unidades por talla. El stock baja solo con cada venta.
- **Pedidos**: estado de cada pedido y de su envío.
- **Eventos**: crear un evento desde plantilla, rellenar cada pestaña, subir los GPX de las etapas, gestionar modalidades y ver los inscritos por modalidad con lo recaudado.
- **Noticias**: publicar noticias por sección.
- **Mensajes**: lo que llega desde el formulario de contacto.
- **Correos**: registro de todos los correos enviados por la web.
- **Usuarios**: cambiar el tipo de cuenta de cada persona y asignar responsables de sección.
- **Subida de imágenes** arrastrando el archivo, en eventos, noticias y productos. Se optimizan solas.
- **Exportar a Excel**: inscritos de un evento, socios, pedidos y usuarios, listos para abrir en Excel. Pensado, por ejemplo, para la entrega de dorsales.

### Diseño y funcionamiento

- Colores rojo y negro, logotipo del club redibujado en alta calidad y favicon optimizado para que aparezca en Google.
- Adaptada a **móvil y tablet**. Se ha revisado pantalla por pantalla a varios tamaños.
- **Se puede instalar en el móvil** como si fuera una aplicación. La web lo sugiere al entrar desde el teléfono.
- Animaciones al pulsar botones, al cambiar de página y al bajar por la portada. Se desactivan si el móvil tiene activada la opción de reducir movimiento.
- Preparada para buscadores: ficha del club para Google, mapa del sitio y vista previa al compartir en WhatsApp o redes.

---

## Qué necesitamos del club para publicar

1. **Fotos reales**: entrenamientos, competiciones, equipos y eventos. Con 20 o 30 buenas la web cambia por completo.
2. **Contenidos reales** de cada sección: responsable, horarios, lugares y descripción.
3. **Cifras reales** para la portada: número de socios, eventos al año y año de fundación.
4. **Cuotas de socio definitivas**: tipos, precios y ventajas de cada una.
5. **Productos de la tienda**: fotos, precios, tallas y stock inicial. Confirmar también el coste de envío y dónde se recoge.
6. **Marcha Ciclista**: fechas, precios, modalidades, alojamiento, programa y los GPX reales de las etapas.
7. **Correos del club** que existan de verdad (por ejemplo `info@…` y uno por sección, si se quiere).
8. **Cuenta de Stripe a nombre del club** para cobrar con tarjeta. Stripe cobra una comisión por pago, en torno al 1,5 % + 0,25 € con tarjetas europeas, y no tiene cuota fija.
9. **Revisión legal** de los textos legales por el asesor del club, sobre todo privacidad, devoluciones y estatutos.
10. **Eslogan**, si el club tiene o quiere uno. Hay un hueco reservado en la portada.
11. **Dominio**: confirmar si el club tiene `clubdeportivobomberos.es` y quién lo gestiona.

## Alojamiento definitivo y coste aproximado

| Concepto | Coste aproximado |
|---|---|
| Servidor VPS (Hostinger KVM 2) con web de pruebas, web real y base de datos | Unos 10 € al mes |
| Dominio | Unos 10 a 15 € al año, si no se tiene ya |
| Envío de correos (Resend) | Gratis hasta 3.000 correos al mes |
| Pasarela de pago (Stripe) | Sin cuota; comisión por cada cobro |

La demo actual está en un servicio gratuito que no permite uso comercial, así que es solo para enseñarla.

En el servidor definitivo habrá dos webs: una **de pruebas**, para revisar cada cambio antes de publicarlo, y la **real**. Así nada llega al público sin haberse probado antes.

---

## Mejoras previstas

### Antes de publicar

- **Correos automáticos de confirmación**: inscripción a un evento, pago de la cuota, pedido de la tienda y aviso al club cuando llega un mensaje de contacto. La web ya envía correos (recuperar contraseña, avisos de renovación); falta añadir estos y conectar el servicio de envío.
- **Pagos reales con Stripe** en cuanto el club tenga su cuenta.
- **Copias de seguridad diarias automáticas** de la base de datos, que tendrá datos de socios y pagos.

### Después del lanzamiento

- **Justificantes en PDF** descargables de cuotas, inscripciones y pedidos.
- **Estadísticas de visitas**, respetando la elección de cookies de cada persona.
- **Pruebas automáticas** del código, para que los cambios futuros no rompan nada de lo que ya funciona.

### Ideas abiertas a lo que diga el club

- Área privada de socios con documentos (actas, convocatorias).
- Galería de fotos por evento.
- Clasificaciones o resultados de las pruebas del club.
- Versión en inglés para eventos con participación internacional.

---

## Cómo probar la demo

En **https://club-deportivo-bomberos.vercel.app/demo** están las cuentas de prueba y un recorrido guiado de cinco minutos. Por ejemplo:

- **Socio**: `socio@demo.es` / `Socio1234!`
- **Participante**: `participante@demo.es` / `Participante1234!`
- **Responsable de ciclismo**: `ciclismo@demo.es` / `Ciclismo1234!`
- **Administrador**: ver la página `/demo`.

Cualquier comentario, error o idea que surja al probarla sirve para ajustar la web antes de publicarla.
