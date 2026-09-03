import type { PrismaConfig } from "prisma";

/** Configuración de Prisma (sustituye a la clave `prisma` del package.json). */
export default {
  schema: "prisma/schema.prisma",
  migrations: { seed: "tsx prisma/seed.ts" },
} satisfies PrismaConfig;
