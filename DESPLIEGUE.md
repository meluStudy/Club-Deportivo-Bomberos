# Despliegue: entorno de pruebas y producción

Guía para poner la web en marcha en un **VPS de Hostinger (plan KVM 2)** con
**Coolify**, en dos entornos: uno de pruebas donde se valida cada cambio y otro
de producción que ve el público.

---

## 1. Qué necesita la web para funcionar

| Requisito | Detalle |
| --- | --- |
| Node.js | 20.9 o superior (probado con 22) |
| Base de datos | PostgreSQL 14 o superior |
| Disco persistente | Para las imágenes que se suben desde el panel (`UPLOADS_DIR`) |
| Dominio con HTTPS | Obligatorio: las sesiones usan cookies seguras y Stripe exige HTTPS |
| Correo saliente | Resend o el SMTP del dominio, para recuperar contraseña y avisos |

La compilación **no necesita la base de datos**: se puede construir la web
aunque PostgreSQL esté apagado. Esto está comprobado y evita que un despliegue
falle por un problema de conexión.

---

## 2. Contratar y preparar el VPS

### 2.1. El plan

En Hostinger, **VPS KVM 2** (2 vCPU y 8 GB de RAM en el catálogo actual;
comprueba las características al contratar). Con 8 GB va sobrado para los dos
entornos y las dos bases de datos. Elige el centro de datos más cercano a
España.

Al crearlo, Hostinger pregunta por el sistema operativo. Dos caminos:

- **Camino corto**: en la lista de plantillas de aplicaciones, si aparece
  **Coolify**, elígela. Hostinger instala Ubuntu y Coolify de una vez y te da
  la dirección del panel al terminar. Puedes saltar al punto 2.3.
- **Camino manual**: elige **Ubuntu 24.04** limpio y sigue el punto 2.2.

Durante la creación, Hostinger pide una contraseña de root y permite añadir una
clave SSH. Añade tu clave pública: es más cómodo y más seguro que la contraseña.

### 2.2. Instalar Coolify a mano

Desde tu ordenador:

```bash
ssh root@IP-DE-TU-VPS

# Actualizar el sistema
apt update && apt upgrade -y

# Instalar Coolify (instala Docker y todo lo necesario)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Tarda unos minutos. Al acabar muestra la dirección del panel, que será
`http://IP-DE-TU-VPS:8000`. Ábrela en el navegador y **crea la cuenta de
administrador en ese mismo momento**: el primero que entre se queda con el
panel.

### 2.3. Cortafuegos

En el panel de Hostinger (hPanel), sección de cortafuegos del VPS, deja
abiertos solo estos puertos de entrada:

| Puerto | Para qué |
| --- | --- |
| 22 | SSH |
| 80 | HTTP (necesario para emitir los certificados) |
| 443 | HTTPS |
| 8000 | Panel de Coolify |

Una vez que asignes un dominio propio al panel de Coolify (por ejemplo
`panel.clubdeportivobomberos.es`), puedes cerrar el 8000.

### 2.4. Un par de ajustes recomendados

```bash
# Zona horaria de Madrid, para que las horas de los registros cuadren
timedatectl set-timezone Europe/Madrid

# Actualizaciones de seguridad automáticas
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 3. DNS del dominio

En el panel donde tengas el dominio, tres registros apuntando a la IP del VPS:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `@` | IP del servidor |
| A | `www` | IP del servidor |
| A | `test` | IP del servidor |

Resultado: `clubdeportivobomberos.es` (producción) y
`test.clubdeportivobomberos.es` (pruebas). Los cambios de DNS pueden tardar un
rato en propagarse; espera a que respondan antes de emitir los certificados.

---

## 4. Montar los dos entornos en Coolify

### 4.1. Conectar GitHub

En Coolify, **Sources → GitHub → Add**. Autoriza el acceso al repositorio del
club. Así Coolify podrá desplegar solo cada vez que se actualice una rama.

### 4.2. Las dos bases de datos

**New Resource → Database → PostgreSQL**, dos veces:

- `cdb-produccion`
- `cdb-test`

Coolify genera la contraseña y la cadena de conexión de cada una. Guárdalas.
En la de producción, activa las copias de seguridad automáticas (diarias) con
destino en un almacenamiento externo tipo S3 o Backblaze.

### 4.3. Las dos aplicaciones

**New Resource → Application → GitHub → este repositorio**. Se crean dos
aplicaciones idénticas salvo la rama, el dominio y las variables:

| | Producción | Pruebas |
| --- | --- | --- |
| Rama | `main` | `develop` |
| Dominio | `clubdeportivobomberos.es` | `test.clubdeportivobomberos.es` |
| Base de datos | `cdb-produccion` | `cdb-test` |
| Stripe | Claves reales | Claves de prueba |

Configuración en las dos:

- **Build pack**: Nixpacks (Coolify detecta Next.js automáticamente).
- **Build command**: `npm ci && npm run build`
- **Start command**: `npm run db:deploy && npm start`
- **Port**: `3000`
- **Health check path**: `/api/salud` — Coolify comprueba ahí que la web está
  viva y hablando con la base de datos antes de dar el despliegue por bueno.
- **Volumen persistente**: origen `/datos/cdb-produccion/uploads` (y
  `/datos/cdb-test/uploads` en pruebas), destino dentro del contenedor
  `/datos/uploads`. Después define `UPLOADS_DIR=/datos/uploads`. **Sin este
  volumen, las imágenes subidas desde el panel desaparecen en cada despliegue.**
- **HTTPS**: activa el certificado automático de Let's Encrypt.
- En la aplicación de pruebas, activa además la **autenticación básica** que
  ofrece Coolify, para que no entre nadie de fuera ni la indexe Google.

### 4.4. Variables de entorno

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

# Solo para el primer arranque, para crear el administrador
ADMIN_EMAIL="…"
ADMIN_PASSWORD="…"
```

Genera cada `AUTH_SECRET` con:

```bash
openssl rand -base64 48
```

**Nunca uses el mismo `AUTH_SECRET` en pruebas y en producción**: si se filtra
el de pruebas, quedarían expuestas las sesiones de producción.

### 4.5. Primer arranque

Con la aplicación desplegada, desde la consola que ofrece Coolify:

```bash
npm run db:seed     # crea el administrador, las secciones y los datos de ejemplo
```

En producción, ejecútalo una sola vez. Después:

1. Entra con el administrador y **cambia la contraseña**.
2. Borra desde el panel los usuarios de ejemplo (`socio@demo.es`,
   `participante@demo.es`, `ciclismo@demo.es`).

---

## 5. Flujo de trabajo

El repositorio tiene tres tipos de rama:

```
main       ← producción. Solo recibe cambios ya validados en pruebas.
develop    ← pruebas. Aquí va todo lo nuevo.
claude/*   ← ramas de trabajo, una por tanda de cambios.
```

El ciclo completo:

1. **Trabajamos** en una rama `claude/…`.
2. **A `develop`**: al fusionarla, Coolify despliega solo en
   `test.clubdeportivobomberos.es`.
3. **Compruebas** en la web de pruebas con calma: inscripciones, pagos con las
   tarjetas de prueba de Stripe, subida de imágenes, correos.
4. **A `main`**: cuando das el visto bueno, se fusiona `develop` en `main` y se
   despliega en producción.

Un matiz importante: **no se copian archivos de pruebas a producción**. Lo que
se promociona es el mismo commit ya probado, mediante la fusión de ramas. Así
producción ejecuta exactamente el código que validaste. Las bases de datos, en
cambio, están separadas y no se copian nunca de un entorno a otro (salvo que
quieras llevar una copia de producción a pruebas para depurar algo, que se hace
con `pg_dump` y `pg_restore`).

### Cambios en la base de datos

Cuando una tanda de cambios toca el modelo de datos, la migración se genera en
desarrollo y viaja en el mismo commit:

```bash
npm run db:migrate      # crea la migración en prisma/migrations/
```

Al desplegar, el comando de arranque ejecuta `npm run db:deploy`, que aplica las
migraciones pendientes. No hay que hacer nada a mano en el servidor.

### Si algo sale mal

En Coolify, cada despliegue queda guardado y hay un botón de **Rollback** para
volver al anterior en segundos. Si el problema es de datos, se restaura la copia
de seguridad de la base.

---

## 6. Copias de seguridad

Lo mínimo antes de abrir al público:

- **Base de datos de producción**: copia diaria automática desde Coolify, con
  destino fuera del servidor y quince días de histórico.
- **Carpeta de imágenes** (`UPLOADS_DIR`): copia semanal, por ejemplo con
  `rclone` a un almacenamiento externo.
- **Prueba de restauración**: al menos una vez, restaura la copia en el entorno
  de pruebas para comprobar que sirve. Una copia sin probar no es una copia.

---

## 7. Antes de abrir al público

- [ ] Contraseña del administrador cambiada y usuarios de ejemplo borrados.
- [ ] Claves reales de Stripe y webhook apuntando a
      `https://clubdeportivobomberos.es/api/webhooks/stripe`.
- [ ] Correo del dominio configurado y verificado (SPF, DKIM y DMARC), o las
      notificaciones acabarán en la carpeta de correo no deseado.
- [ ] Textos legales revisados por el asesor del club.
- [ ] Fotografías reales sustituyendo las ilustraciones provisionales.
- [ ] Copias de seguridad activadas y probadas.
- [ ] Web de pruebas protegida con contraseña.
- [ ] Dominio dado de alta en Google Search Console.
