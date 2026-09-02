import "server-only";
import { prisma } from "./prisma";

export const getSections = () => prisma.section.findMany({ where: { active: true }, orderBy: { order: "asc" } });

export const getSection = (slug: string) =>
  prisma.section.findUnique({
    where: { slug },
    include: {
      posts: { where: { publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" }, take: 3 },
      events: { where: { published: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 3 },
    },
  });

export const getPosts = (opts: { take?: number; featured?: boolean; sectionSlug?: string } = {}) =>
  prisma.post.findMany({
    where: {
      publishedAt: { lte: new Date() },
      ...(opts.featured ? { featured: true } : {}),
      ...(opts.sectionSlug ? { section: { slug: opts.sectionSlug } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: opts.take,
    include: { section: { select: { name: true, slug: true } } },
  });

export const getPost = (slug: string) => prisma.post.findUnique({ where: { slug }, include: { section: true, author: { select: { name: true } } } });

export const getUpcomingEvents = (take?: number) =>
  prisma.event.findMany({
    where: { published: true, startsAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
    orderBy: { startsAt: "asc" },
    take,
    include: { section: { select: { name: true, slug: true } }, _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } },
  });

export const getPastEvents = (take = 6) =>
  prisma.event.findMany({ where: { published: true, startsAt: { lt: new Date() } }, orderBy: { startsAt: "desc" }, take, include: { section: { select: { name: true, slug: true } } } });

export const getEvent = (slug: string) =>
  prisma.event.findUnique({ where: { slug }, include: { section: true, _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } } });

export const getProducts = (opts: { featured?: boolean; category?: string; take?: number } = {}) =>
  prisma.product.findMany({
    where: { active: true, ...(opts.featured ? { featured: true } : {}), ...(opts.category ? { category: opts.category } : {}) },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: opts.take,
    include: { variants: true },
  });

export const getProduct = (slug: string) => prisma.product.findUnique({ where: { slug }, include: { variants: { orderBy: { sku: "asc" } } } });

export const getPlans = () => prisma.membershipPlan.findMany({ where: { active: true }, orderBy: { priceCents: "desc" } });

export async function getActiveMembership(userId: string) {
  return prisma.membership.findFirst({ where: { userId, status: "ACTIVE", expiresAt: { gte: new Date() } }, include: { plan: true }, orderBy: { expiresAt: "desc" } });
}
