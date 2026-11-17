# Guion de la presentación de la web

**Reunión con la Junta y los responsables de sección** · Noviembre de 2026

Demo: **https://club-deportivo-bomberos.vercel.app**

---

## La idea de la reunión

Que salgan sabiendo tres cosas:

1. **Qué hace la web**, vista desde su papel (socio, responsable de sección, administrador).
2. **Qué tiene que aportar cada uno** para publicarla.
3. **Qué hay que decidir y contratar**, y en qué orden.

Duración prevista: **una hora**. Enseña más y explica menos: la demo convence más que cualquier explicación.

---

## Antes de la reunión

**El día anterior**

- [ ] Abre la demo y entra con cada cuenta. Si quieres que esté limpia de tus pruebas, reiníciala (instrucciones al final).
- [ ] Imprime o envía el PDF *Nueva web del Club* para que cada asistente lo tenga.
- [ ] Ten a mano la plantilla de la tienda (`plantilla-tienda.xlsx`) para enviarla al terminar.

**Media hora antes**

- [ ] Abre la demo una vez: el servicio gratuito de la base de datos «se duerme» y la primera carga tarda unos segundos.
- [ ] Deja preparadas **tres sesiones abiertas a la vez**, para no tener que salir y entrar con cada cuenta delante de todos:
  - Navegador normal: **administrador**.
  - Ventana de incógnito: **socio** (`socio@demo.es` / `Socio1234!`).
  - Otro navegador (Edge, Firefox o un segundo perfil de Chrome): **responsable de ciclismo** (`ciclismo@demo.es` / `Ciclismo1234!`).
- [ ] Comprueba que el ordenador abre con Excel los archivos que descarga la web (para enseñar una exportación).
- [ ] Plan B si falla la wifi: comparte datos desde el móvil.
- [ ] Proyecta o imprime el **código QR** de la última página, para que abran la web en su móvil.

---

## Guion paso a paso

### 1. Apertura · 3 minutos

**Qué decir:**

> «La idea es tener en un solo sitio todo lo que hoy hacemos por WhatsApp, Excel y transferencias: noticias, inscripciones a eventos con pago, la tienda y las cuotas de socio. Y que cada sección pueda llevar lo suyo sin depender de nadie.»

> «Lo que vais a ver funciona de verdad, pero los textos, fotos, precios y cifras son de ejemplo. Los pagos están simulados: no se cobra nada.»

### 2. Demo en directo · 20 minutos

Sigue este orden: cuenta la historia de una persona que llega a la web, se hace socia, se apunta a la marcha y compra la camiseta. Luego se ve cómo lo gestiona el club.

**a) Como visitante · 3 min**

- Portada → baja despacio (animaciones y cifras).
- Entra en **Secciones** y abre la de algún responsable presente: *«Esta sería tu página.»*
- Abre una noticia.
- **Pide que escaneen el QR**: que la vean en su móvil y prueben a instalarla en la pantalla de inicio.

**b) Como socio · 3 min** (ventana de incógnito)

- **Mi cuenta** → carné de socio con número y temporada.
- **Tienda** → una camiseta: el precio de socio sale solo. Elige talla y añádela al carrito.
- Paga → pantalla de pago simulado → «Pago correcto» → el pedido aparece en su cuenta.

**c) Un evento: la Marcha Ciclista · 5 min**

- Abre `/marcha-ciclista-bomberos` y recorre las pestañas.
- **Etapas**: mapa, perfil de altimetría y descarga del GPX. *Suele ser lo que más impresiona.*
- **Inscripciones**: elige una modalidad y verás cambiar el precio. Enseña los datos que pide (DNI, talla, contacto de emergencia).

**d) Como responsable de sección · 5 min** (el otro navegador) ← *lo más importante para ellos*

- **Admin → Eventos → Nuevo evento** con la plantilla «marcha ciclista»: se crea con las pestañas listas para rellenar.
- Rellena una pestaña y **sube una foto arrastrándola**.
- Enseña los **inscritos por modalidad** y lo recaudado.
- Exporta los inscritos a **Excel** y ábrelo: *«Esta es la lista para la entrega de dorsales.»*
- Publica una **noticia** de su sección.
- **Qué decir:** *«Cada responsable solo ve y gestiona su sección. No puede tocar nada de las demás.»*

**e) Como administrador · 4 min** (navegador normal)

- **Resumen**: ingresos, socios por tipo de cuota, stock bajo.
- **Socios**: recuento por temporada y **aviso de renovación en bloque**.
- **Tienda y stock**: cambia el stock de una talla delante de ellos.
- **Pedidos** y **Mensajes** del formulario de contacto.
- **Usuarios**: *«Aquí os daré acceso a cada uno como responsable de vuestra sección.»*

### 3. Qué es de ejemplo y qué falta · 3 minutos

**Qué decir:**

> «Todo lo que habéis visto funciona. Lo que no es real es el contenido: fotos, textos, precios y cifras. Y hay dos piezas que se conectan al publicar: el cobro con tarjeta de verdad y el envío de correos.»

### 4. Qué necesito de cada uno · 10 minutos

**De la Junta**

- Decidir y contratar el **servidor y el dominio** (unos 10 € al mes, más el dominio si no lo tenemos).
- Abrir la **cuenta de Stripe** a nombre del club para cobrar con tarjeta. Hace falta el CIF, la cuenta bancaria del club y los datos del presidente o representante.
- Decidir las **cuotas de socio definitivas** (tipos, precios y ventajas).
- Pasar los **textos legales** por el asesor del club.
- Confirmar los **correos del club** que existen (o crearlos) y quién gestiona el **dominio** `clubdeportivobomberos.es`.
- Elegir quién será **administrador** de la web.

**De cada responsable de sección**

- Texto de presentación, horarios y lugares de entrenamiento, y nombre del responsable.
- **10 o 15 fotos** buenas de la sección.
- Eventos previstos de la temporada con fechas.
- **Registrarse en la web** con su correo para que le dé acceso a su sección.

**De quien lleve la tienda (la ropa)**

- Rellenar la **plantilla de Excel** con el catálogo: una fila por talla y color, con precio, precio de socio y stock.
- Enviar las **fotos** de cada prenda con los nombres que pongan en la plantilla.
- Rellenar los datos generales: coste de envío, lugar y horario de recogida, y quién gestiona los pedidos.
- Si ya tenéis el inventario en otro Excel, del proveedor por ejemplo, **mandádmelo tal cual** y lo adapto yo.

> **Importante sobre el stock:** desde el día que se abra la tienda, el stock de verdad es el de la web. Si se vende ropa en mano (en un evento o en el parque), hay que descontarla en el panel para no vender tallas que ya no quedan.

**De la sección de ciclismo, para la Marcha**

- Fechas, precios y modalidades, alojamiento, programa día a día y **los GPX reales** de las etapas.

### 5. Pasos para lanzar · 5 minutos

Enséñalo como una hoja de ruta (detalle en el apartado siguiente):

1. **Contratar** servidor, dominio y Stripe.
2. **Montar** la web de pruebas y la web real en el servidor.
3. **Terminar lo que falta** en la web: correos automáticos e importación del catálogo.
4. **Cargar el contenido real**: secciones, ropa, cuotas, Marcha y fotos.
5. **Probar entre todos** en la web de pruebas durante una semana.
6. **Abrir al público** y avisar a los socios.

**Qué decir:**

> «El tiempo depende sobre todo de lo rápido que nos llegue el material. La parte técnica son unos días; la que más tarda es reunir fotos, textos y la ropa.»

### 6. Decisiones que necesito hoy · 5 minutos

Lleva esta lista y apunta las respuestas:

- [ ] ¿Aprobamos el servidor y el dominio? ¿Quién lo paga y a nombre de quién?
- [ ] ¿Quién abre la cuenta de Stripe?
- [ ] ¿Quién será administrador y quién responsable de cada sección?
- [ ] ¿Quién lleva la tienda y los pedidos?
- [ ] **Socios actuales**: ¿los cargamos desde una lista, con su cuota de esta temporada ya marcada como pagada, o pedimos a cada uno que se registre? Recomiendo cargarlos: es más cómodo para ellos y no hay que cobrar dos veces.
- [ ] ¿Fecha objetivo de lanzamiento? Por ejemplo, para la próxima temporada o para la Marcha.

### 7. Preguntas · 10 minutos

Respuestas preparadas para las preguntas más probables:

**¿Cuánto cuesta?**
Unos 10 € al mes de servidor, el dominio (10 a 15 € al año) y la comisión de Stripe por cada cobro (en torno al 1,5 % + 0,25 € por pago con tarjeta europea). Los correos son gratis hasta 3.000 al mes.

**¿Quién la mantiene? ¿Y si quiero cambiar algo?**
Me lo pedís y lo hago. Cada cambio se prueba primero en la web de pruebas y solo pasa a la real cuando está bien.

**¿Es un WordPress?**
No. Es una web a medida, hecha para el club. Por eso hace cosas que en WordPress necesitarían muchos plugins de pago: inscripciones por modalidad, GPX con mapa o cuotas de socio.

**¿Y la protección de datos?**
El servidor estará en Europa, las contraseñas se guardan cifradas, hay copias de seguridad y cada responsable solo ve los datos de su sección. Los textos legales están redactados para el club, pero tiene que revisarlos el asesor.

**¿Se puede pagar por transferencia o Bizum?**
Ahora mismo, con tarjeta. Se pueden estudiar otros métodos si el club lo necesita.

**¿Una persona puede llevar dos secciones?**
Ahora mismo, una por persona. Si hace falta, se amplía.

**¿Se puede usar como aplicación en el móvil?**
Sí: se instala en la pantalla de inicio y se abre como una app, sin pasar por la tienda de aplicaciones.

### Cierre · 1 minuto

> «Os envío hoy el resumen en PDF y la plantilla de la ropa. En cuanto tengamos las decisiones de la Junta, empezamos a montar el servidor.»

---

## Hoja de ruta detallada (para ti)

| Fase | Qué hay que hacer | Quién | Depende de |
|---|---|---|---|
| **1. Contratar** | Servidor Hostinger KVM 2 (en un centro de datos europeo), dominio, cuenta de Stripe del club | Junta | Aprobación del gasto |
| **2. Correo** | Buzones reales (`info@…`) y verificar el dominio en Resend para los correos automáticos | Tú, con mi ayuda | Acceso al dominio |
| **3. Servidor** | Instalar Coolify; web de pruebas (`develop`) y web real (`main`); base de datos; HTTPS; copias de seguridad diarias. Guía en `DESPLIEGUE.md` | Tú, con mi ayuda | Fase 1 |
| **4. Desarrollo pendiente** | Correos de confirmación (inscripción, cuota, pedido), aviso de pedidos al encargado de la tienda, **importador del Excel de ropa**, arranque de la web real **sin datos de ejemplo** y, si se decide, importación de socios actuales | Yo | Nada: puedo empezar ya |
| **5. Contenido** | Secciones, fotos, cuotas, ropa (plantilla), Marcha Ciclista, revisión legal, eslogan | Club | Responsables de sección y tienda |
| **6. Pruebas** | Una semana en la web de pruebas: cada responsable prueba su sección y se hace un pago real pequeño con su devolución | Todos | Fases 3 a 5 |
| **7. Lanzamiento** | Quitar el modo demo, pasar a `main`, conectar el dominio, avisar a los socios (correo, WhatsApp, Instagram) y dar de alta la web en Google | Tú y yo | Fase 6 |

**Cuidado con el dominio:** si el club ya tiene correo con `clubdeportivobomberos.es`, al apuntar el dominio al servidor nuevo **solo se cambian los registros de la web**. Los del correo (MX) no se tocan, o el club se quedaría sin recibir emails.

**Cómo entra la ropa en la web:**

1. Quien lleve la tienda rellena la plantilla y envía las fotos.
2. Me lo pasas y lo cargo en la **web de pruebas**.
3. Lo revisáis allí: precios, tallas, fotos y stock.
4. Se carga en la **web real** justo antes de abrir la tienda, con el stock actualizado ese día.

---

## Reiniciar la demo para dejarla limpia

1. En **Neon**, abre el *SQL Editor* y ejecuta: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
2. En **Vercel**, entra en *Deployments* → **Redeploy** del último despliegue.
3. Al terminar, la demo vuelve a tener solo los datos de ejemplo y las cuentas de prueba.

Esto borra todo lo que haya en la demo, incluidas las cuentas que se hayan registrado.
