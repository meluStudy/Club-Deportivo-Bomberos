# Despliegue: entorno de pruebas y producción

Guía para poner la web en marcha con dos entornos: uno de **pruebas** donde se
valida cada cambio y otro de **producción** que ve el público.

---

## 1. Qué necesita la web para funcionar

| Requisito | Detalle |
| --- | --- |
| Node.js | 20.9 o superior (probado con 22) |
| Base de datos | PostgreSQL 14 o superior |
| Disco persistente | Para las imágenes que se suben desde el panel (`UPLOADS_DIR`) |
| Dominio con HTTPS | Obligatorio: las sesiones usan cookies seguras y Stripe exige HTTPS |
| Correo saliente | Resend o el SMTP del dominio, para recuperar contraseña y avisos |

Esto descarta el alojamiento compartido clásico (el de PHP y cPanel): la web
necesita un proceso Node ejecutándose de forma permanente.

---

## 2. Dónde alojarla

### Opción recomendada: un VPS con Coolify

Un único servidor virtual alberga los dos entornos y las dos bases de datos.
**Coolify** es un panel de control que se instala en el servidor y se encarga de
desplegar desde GitHub, renovar los certificados HTTPS, gestionar las variables
de entorno y hacer copias de seguridad. Se maneja desde el navegador.

- **Servidor**: Hostinger VPS KVM 2 o Hetzner CX22. Mínimo 2 vCPU y 4 GB de RAM
  (con 2 GB va justo al compilar). Precio orientativo: entre 5 y 12 € al mes.
- **Sistema**: Ubuntu 24.04.
- **Coste total** aproximado: el VPS más el dominio. Sin más cuotas.

Ventajas: las imágenes subidas se guardan en el disco del servidor sin
configurar nada más, la base de datos está al lado de la web (rápida y sin
coste aparte) y los dos entornos caben en la misma máquina.

Inconveniente: el servidor es tuyo, así que las actualizaciones del sistema y
las copias de seguridad son responsabilidad del club. Coolify automatiza casi
todo, pero conviene revisarlo de vez en cuando.

### Alternativa sin servidor propio: Vercel más Neon

- **Vercel** aloja la web: cada rama genera su propia dirección de pruebas y
  `main` va a producción, sin configurar nada.
- **Neon** o **Supabase** para PostgreSQL, con una base de datos por entorno.
- **Cloudflare R2** o **Vercel Blob** para las imágenes subidas: Vercel no tiene
  disco persistente, así que hay que cambiar el final de
  `src/app/api/uploads/route.ts` para que escriba en el almacenamiento externo.
- Coste orientativo: el plan Pro de Vercel ronda los 20 $ al mes (el gratuito no
  cubre usos comerciales, y la tienda lo es), más lo que consuma la base de datos.

Ventaja: cero mantenimiento de servidor y vuelta atrás inmediata. Inconveniente:
más caro y hay que tocar el código de las subidas.

### Lo que no recomiendo

- **Alojamiento compartido de Hostinger** (el de webs PHP): no puede ejecutar
  Next.js.
- **Node.js hosting de Hostinger**: limitado en memoria y sin buen control del
  proceso; la compilación de Next.js se queda corta.

---

## 3. Montaje paso a paso en un VPS con Coolify

### 3.1. Preparar el servidor

```bash
ssh root@IP-DEL-SERVIDOR
apt update && apt upgrade -y
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Al terminar, Coolify indica la dirección del panel. Entra, crea la cuenta de
administrador y conecta la cuenta de GitHub para que pueda leer el repositorio.

### 3.2. DNS del dominio

En el panel del dominio, dos registros apuntando a la IP del servidor:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `@` | IP del servidor |
| A | `www` | IP del servidor |
| A | `test` | IP del servidor |

Resultado: `clubdeportivobomberos.es` (producción) y
`test.clubdeportivobomberos.es` (pruebas).

### 3.3. Las dos bases de datos

En Coolify, **New Resource → PostgreSQL**, dos veces:

- `cdb-produccion`
- `cdb-test`

Coolify genera la contraseña y la cadena de conexión de cada una. Activa las
copias de seguridad automáticas de la de producción (diarias, con destino en un
almacenamiento externo tipo S3 o Backblaze).

### 3.4. Las dos aplicaciones

**New Resource → Application → GitHub**, apuntando a este repositorio. Se crean
dos aplicaciones con la misma configuración salvo la rama y las variables:

| | Producción | Pruebas |
| --- | --- | --- |
| Rama | `main` | `develop` |
| Dominio | `clubdeportivobomberos.es` | `test.clubdeportivobomberos.es` |
| Base de datos | `cdb-produccion` | `cdb-test` |
| Stripe | Claves reales | Claves de prueba |

En ambas:

- **Build command**: `npm ci && npm run build`
- **Start command**: `npm run db:deploy && npm start`
- **Port**: `3000`
- **Volumen persistente**: monta `/datos/uploads` y define
  `UPLOADS_DIR=/datos/uploads`. Sin esto, las imágenes subidas desde el panel se
  pierden en cada despliegue.
- **HTTPS**: activa el certificado automático de Let's Encrypt.

En la aplicación de pruebas conviene añadir autenticación básica desde Coolify,
para que no la vea nadie de fuera ni la indexe Google.

### 3.5. Variables de entorno

Las mismas claves en los dos entornos, con valores distintos:

```bash
DATABASE_URL="postgresql://…"          # la que genera Coolify
AUTH_SECRET="…"                         # distinto en cada entorno
NEXT_PUBLIC_SITE_URL="https://clubdeportivobomberos.es"
UPLOADS_DIR="/datos/uploads"

# Stripe: claves de prueba en test, reales en producción
STRIPE_SECRET_KEY="sk_…"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_…"
STRIPE_WEBHOOK_SECRET="whsec_…"

# Correo
RESEND_API_KEY="re_…"
MAIL_FROM="Club Deportivo Bomberos de Madrid <no-responder@clubdeportivobomberos.es>"

# Solo la primera vez, para crear el administrador con `npm run db:seed`
ADMIN_EMAIL="…"
ADMIN_PASSWORD="…"
```

Genera cada `AUTH_SECRET` con:

```bash
openssl rand -base64 48
```

**Nunca compartas el mismo `AUTH_SECRET` entre pruebas y producción**: si se
filtra el de pruebas, quedarían expuestas las sesiones de producción.

### 3.6. Primer arranque

Con la aplicación ya desplegada, desde la consola que ofrece Coolify:

```bash
npm run db:seed     # crea el administrador, las secciones y los datos de ejemplo
```

En producción, ejecuta el seed una sola vez y después **cambia la contraseña del
administrador**. Los usuarios de ejemplo (`socio@demo.es` y compañía) hay que
borrarlos desde el panel antes de abrir la web al público.

---

## 4. Flujo de trabajo

El repositorio tiene tres tipos de rama:

```
main       ← producción. Solo recibe cambios ya validados en pruebas.
develop    ← pruebas. Aquí va todo lo nuevo.
claude/*   ← ramas de trabajo, una por tanda de cambios.
```

El ciclo completo:

1. **Trabajamos** en una rama `claude/…`.
2. **Pull request de `claude/…` a `develop`**. Al fusionarla, Coolify despliega
   solo en `test.clubdeportivobomberos.es`.
3. **Compruebas** en la web de pruebas con calma: inscripciones, pagos con las
   tarjetas de prueba de Stripe, subida de imágenes, correos.
4. **Pull request de `develop` a `main`**. Al fusionarla, se despliega en
   producción.

Un matiz importante: **no se copian archivos de pruebas a producción**. Lo que
se promociona es el mismo commit, ya probado, mediante la fusión de ramas. Así
producción ejecuta exactamente el código que validaste, sin margen para que se
quede algo por el camino. Las bases de datos, en cambio, están separadas y no se
copian nunca de un entorno a otro (salvo que quieras llevar una copia de
producción a pruebas para depurar algo, que se hace con `pg_dump` y `pg_restore`).

### Cambios en la base de datos

Cuando una tanda de cambios toca el modelo de datos, la migración se genera en
desarrollo y viaja en el mismo commit:

```bash
npm run db:migrate      # crea la migración en prisma/migrations/
```

Al desplegar, el comando de arranque ejecuta `npm run db:deploy`, que aplica las
migraciones pendientes. No hay que hacer nada manualmente.

---

## 5. Copias de seguridad

Lo mínimo antes de abrir al público:

- **Base de datos de producción**: copia diaria automática desde Coolify, con
  destino fuera del servidor y quince días de histórico.
- **Carpeta de imágenes** (`UPLOADS_DIR`): copia semanal, por ejemplo con
  `rclone` a un almacenamiento externo.
- **Prueba de restauración**: al menos una vez, restaura la copia en el entorno
  de pruebas para comprobar que sirve. Una copia sin probar no es una copia.

---

## 6. Antes de abrir al público

- [ ] Cambiar la contraseña del administrador y borrar los usuarios de ejemplo.
- [ ] Claves reales de Stripe y webhook apuntando a
      `https://clubdeportivobomberos.es/api/webhooks/stripe`.
- [ ] Correo del dominio configurado y verificado (SPF, DKIM y DMARC), o las
      notificaciones acabarán en la carpeta de correo no deseado.
- [ ] Textos legales revisados por el asesor del club.
- [ ] Fotografías reales sustituyendo las ilustraciones provisionales.
- [ ] Copias de seguridad activadas y probadas.
- [ ] La web de pruebas protegida con contraseña y con `noindex`.
- [ ] Dar de alta el dominio en Google Search Console para que indexe la web y
      recoja el favicon.
