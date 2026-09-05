# Publicar una demo gratis, sin contratar servidor

Sirve para enseñar la web a la junta directiva o a quien quieras, con una
dirección real que se abre desde cualquier móvil, y para que prueben todo con
cuentas de ejemplo. **No cuesta nada y se monta en unos quince minutos.**

Cuando la demo cumpla su función, se borra y se pasa al VPS de Hostinger
siguiendo [DESPLIEGUE.md](DESPLIEGUE.md). El código es el mismo: solo cambian
las variables de entorno.

---

## Qué vas a montar

| Pieza | Servicio | Coste |
| --- | --- | --- |
| La web | Vercel (plan Hobby) | Gratis |
| La base de datos | Neon (plan gratuito) | Gratis |
| Las imágenes subidas | Dentro de la propia base de datos | Gratis |
| La dirección | `algo.vercel.app` que da Vercel | Gratis |

Vercel no tiene disco donde guardar archivos, así que la web guarda las
imágenes que subas desde el panel dentro de PostgreSQL. Se activa con
`MEDIA_STORAGE="base-datos"`. En el VPS se usará el disco, que es lo suyo.

Una advertencia sobre las condiciones de Vercel: el plan Hobby es para uso
personal y no comercial. Para enseñar la web antes de lanzarla vale; en cuanto
se vendan camisetas de verdad hay que estar en el VPS (o pagar su plan Pro).
Es otra razón para que la demo sea temporal.

---

## 1. La base de datos, en Neon

1. Entra en [neon.tech](https://neon.tech) y crea una cuenta con GitHub.
2. **Create project**. Nombre: `cdb-demo`. Región: Frankfurt o París.
3. Copia la cadena de conexión que te muestra. Es larga y empieza por
   `postgresql://`. Guárdala, la necesitas en el paso siguiente.

---

## 2. La web, en Vercel

1. Entra en [vercel.com](https://vercel.com) y crea una cuenta con GitHub.
2. **Add New → Project** y elige el repositorio del club.
3. En **Branch**, selecciona `develop` (así la demo enseña la versión de
   pruebas y no toca producción).
4. Antes de darle a desplegar, abre **Environment Variables** y añade:

```bash
DATABASE_URL="postgresql://…"     # la de Neon
AUTH_SECRET="…"                    # ver más abajo cómo generarlo
NEXT_PUBLIC_SITE_URL="https://…"   # la que te dé Vercel; se puede corregir después
MEDIA_STORAGE="base-datos"
DEMO_MODE="1"
ADMIN_EMAIL="admin@clubdeportivobomberos.es"
ADMIN_PASSWORD="Admin1234!"
```

Para el `AUTH_SECRET`, cualquier texto largo y aleatorio sirve. Si tienes un
terminal a mano:

```bash
openssl rand -base64 48
```

Si no, vale cualquier cadena de más de 40 caracteres inventados.

5. **Deploy**. Tarda dos o tres minutos.

Deja `STRIPE_SECRET_KEY` sin poner: sin claves de Stripe la web usa su pasarela
simulada, que es justo lo que quieres para una demo.

---

## 3. Cargar los datos de ejemplo

La web ya está en pie, pero la base de datos está vacía. Desde tu ordenador,
con el repositorio descargado:

```bash
npm install
DATABASE_URL="postgresql://…"  npm run db:deploy   # crea las tablas
DATABASE_URL="postgresql://…"  npm run db:seed     # carga los datos de ejemplo
```

(La misma cadena de conexión de Neon en los dos comandos.)

Si prefieres no tocar nada en tu ordenador, Neon tiene un editor de SQL en su
panel, pero es más engorroso: dímelo y te preparo el archivo SQL para pegarlo.

---

## 4. Ajustar la dirección

Vercel te da una dirección del tipo `club-deportivo-bomberos.vercel.app`.
Cópiala y vuelve a **Settings → Environment Variables** para poner esa misma
dirección en `NEXT_PUBLIC_SITE_URL`. Luego, en **Deployments**, pulsa
**Redeploy**. Esto hace que los enlaces de los correos y las redirecciones de
pago apunten bien.

---

## 5. Lo que verá quien entre

- Una franja amarilla arriba avisando de que es una demostración y de que los
  pagos son simulados.
- Un enlace a `/demo` con las cuatro cuentas de prueba, sus contraseñas y un
  recorrido de cinco minutos por lo que hace la web.

Las cuentas son:

| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Administrador | el de `ADMIN_EMAIL` | el de `ADMIN_PASSWORD` |
| Responsable de ciclismo | `ciclismo@demo.es` | `Ciclismo1234!` |
| Socio con cuota | `socio@demo.es` | `Socio1234!` |
| Participante | `participante@demo.es` | `Participante1234!` |

Quien pruebe la web puede además **crear su propia cuenta** desde el formulario
de registro, hacerse socio y comprar en la tienda: todo funciona, con la
pasarela simulada.

---

## 6. Cuando termine la demo

1. En Vercel, borra el proyecto (**Settings → Delete Project**).
2. En Neon, borra el proyecto `cdb-demo`.
3. Monta el VPS siguiendo [DESPLIEGUE.md](DESPLIEGUE.md), con
   `DEMO_MODE` sin valor y `MEDIA_STORAGE="disco"`.

Nada de lo que se haga en la demo pasa a la web real: son bases de datos
distintas.

---

## Alternativa aún más rápida: sin publicar nada

Si solo quieres enseñársela a alguien que esté contigo, se puede levantar en tu
ordenador y verla en `localhost:3000`. Necesitas Node y un PostgreSQL, y está
explicado en el [README](README.md). La demo publicada es mejor cuando la
persona está lejos o quieres que la pruebe con calma desde su móvil.
