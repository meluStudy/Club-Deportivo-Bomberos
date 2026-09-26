/**
 * Compilación en Vercel. Vercel ejecuta el script «vercel-build» en lugar de
 * «build», así que aquí se prepara también la base de datos:
 *
 *  1. Aplica las migraciones pendientes (crea las tablas la primera vez).
 *  2. En modo demo (DEMO_MODE=1), si la base de datos está vacía, carga los
 *     datos de ejemplo. Si ya tiene usuarios no toca nada.
 *  3. Compila la web.
 *
 * Las migraciones van por la conexión directa de Neon si existe
 * (DATABASE_URL_UNPOOLED), porque la conexión con «pooler» no las admite bien.
 */
import { execSync } from "node:child_process";

const ejecutar = (orden, env = process.env) => execSync(orden, { stdio: "inherit", env });

const conexionDirecta = process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

ejecutar("npx prisma generate");

if (!conexionDirecta) {
  console.warn("⚠️  DATABASE_URL no está configurada: se compila sin preparar la base de datos.");
} else {
  const envDirecto = { ...process.env, DATABASE_URL: conexionDirecta };
  console.log("▶ Aplicando migraciones…");
  ejecutar("npx prisma migrate deploy", envDirecto);

  if (process.env.DEMO_MODE === "1") {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient({ datasourceUrl: conexionDirecta });
    const usuarios = await prisma.user.count();
    await prisma.$disconnect();
    if (usuarios === 0) {
      console.log("▶ Base de datos vacía: cargando los datos de ejemplo…");
      ejecutar("npx tsx prisma/seed.ts", envDirecto);
    } else {
      console.log(`▶ La base de datos ya tiene ${usuarios} usuarios: no se cargan datos de ejemplo.`);
    }
  }
}

ejecutar("npx next build");
