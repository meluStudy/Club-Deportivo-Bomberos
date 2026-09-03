import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { legalPages } from "@/lib/legal";

/**
 * El mapa del sitio consulta la base de datos, así que se genera al recibir la
 * petición y no al compilar. De lo contrario el despliegue exigiría tener la
 * base de datos accesible durante la compilación.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sections, posts, events, products] = await Promise.all([
    prisma.section.findMany({ where: { active: true }, select: { slug: true } }),
    prisma.post.findMany({ where: { publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } }),
    prisma.event.findMany({ where: { published: true }, select: { slug: true } }),
    prisma.product.findMany({ where: { active: true }, select: { slug: true } }),
  ]);
  const base = site.url;
  return [
    ...["", "/secciones", "/actualidad", "/eventos", "/tienda", "/socios", "/contacto"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...sections.map((s) => ({ url: `${base}/secciones/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: `${base}/actualidad/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...events.map((e) => ({ url: `${base}/${e.slug}`, priority: 0.6 })),
    ...products.map((p) => ({ url: `${base}/tienda/${p.slug}`, priority: 0.5 })),
    ...legalPages.map((l) => ({ url: `${base}/legal/${l.slug}`, priority: 0.2 })),
  ];
}
