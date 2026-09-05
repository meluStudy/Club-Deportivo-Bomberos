import { existsSync } from "node:fs";
import type { PrismaConfig } from "prisma";

// Al usar este archivo, Prisma deja de leer el .env por su cuenta: lo cargamos aquí.
if (existsSync(".env")) process.loadEnvFile(".env");

/** Configuración de Prisma (sustituye a la clave `prisma` del package.json). */
export default {
  schema: "prisma/schema.prisma",
  migrations: { seed: "tsx prisma/seed.ts" },
} satisfies PrismaConfig;
