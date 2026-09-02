"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canManageSection, isAdmin, requireAdmin, requireStaff } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => Number(String(fd.get(k) ?? "0").replace(",", "."));
const cents = (fd: FormData, k: string) => Math.round(num(fd, k) * 100);
const optCents = (fd: FormData, k: string) => (str(fd, k) === "" ? null : cents(fd, k));

function refresh() {
  revalidatePath("/", "layout");
}

// ─── Stock ───
export async function updateStockAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "variantId");
  const stock = Math.max(0, Math.floor(num(formData, "stock")));
  await prisma.productVariant.update({ where: { id }, data: { stock } });
  refresh();
}

export async function toggleProductAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const p = await prisma.product.findUnique({ where: { id } });
  if (p) await prisma.product.update({ where: { id }, data: { active: !p.active } });
  refresh();
}

export async function upsertProductAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const data = {
    name,
    slug: str(formData, "slug") || slugify(name),
    category: str(formData, "category") || "General",
    description: str(formData, "description"),
    priceCents: cents(formData, "price"),
    memberPriceCents: optCents(formData, "memberPrice"),
    images: JSON.stringify(str(formData, "image") ? [str(formData, "image")] : []),
    featured: formData.get("featured") === "on",
    active: formData.get("active") !== "off",
  };
  const variantsRaw = str(formData, "variants"); // líneas "Talla|Color|Stock"
  const product = id ? await prisma.product.update({ where: { id }, data }) : await prisma.product.create({ data });
  if (variantsRaw) {
    for (const line of variantsRaw.split("\n")) {
      const [size, color, stock] = line.split("|").map((s) => s?.trim());
      if (!size && !color) continue;
      const sku = `${product.slug}-${color || "unico"}-${size || "unica"}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.productVariant.upsert({
        where: { sku },
        update: { stock: Math.max(0, Number(stock) || 0), size: size || null, color: color || null },
        create: { productId: product.id, sku, size: size || null, color: color || null, stock: Math.max(0, Number(stock) || 0) },
      });
    }
  }
  refresh();
}

// ─── Pedidos ───
export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status") as "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  await prisma.order.update({ where: { id }, data: { status } });
  refresh();
}

// ─── Noticias ───
export async function upsertPostAction(formData: FormData) {
  const admin = await requireStaff();
  const id = str(formData, "id");
  const title = str(formData, "title");
  const sectionId = isAdmin(admin) ? str(formData, "sectionId") || null : admin.managedSectionId;
  if (!canManageSection(admin, sectionId)) return;
  if (id) {
    const current = await prisma.post.findUnique({ where: { id } });
    if (!current || !canManageSection(admin, current.sectionId)) return;
  }
  const data = {
    title,
    slug: str(formData, "slug") || slugify(title),
    excerpt: str(formData, "excerpt"),
    content: str(formData, "content"),
    coverImage: str(formData, "image") || null,
    sectionId,
    featured: formData.get("featured") === "on",
    publishedAt: formData.get("published") === "on" ? new Date() : null,
    authorId: admin.id,
  };
  if (id) {
    const existing = await prisma.post.findUnique({ where: { id } });
    await prisma.post.update({ where: { id }, data: { ...data, publishedAt: data.publishedAt ? existing?.publishedAt ?? data.publishedAt : null } });
  } else await prisma.post.create({ data });
  refresh();
}

export async function deletePostAction(formData: FormData) {
  const staff = await requireStaff();
  const post = await prisma.post.findUnique({ where: { id: str(formData, "id") } });
  if (!post || !canManageSection(staff, post.sectionId)) return;
  await prisma.post.delete({ where: { id: post.id } });
  refresh();
}

// ─── Socios / usuarios ───
export async function setUserRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = str(formData, "id");
  const role = str(formData, "role") as "ADMIN" | "SOCIO" | "PARTICIPANTE";
  const managedSectionId = str(formData, "managedSectionId") || null;
  if (id === admin.id) return;
  await prisma.user.update({ where: { id }, data: { role, managedSectionId } });
  refresh();
}

export async function markMembershipPaidAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const m = await prisma.membership.update({ where: { id }, data: { status: "ACTIVE", paidAt: new Date() } });
  await prisma.user.updateMany({ where: { id: m.userId, role: "PARTICIPANTE" }, data: { role: "SOCIO" } });
  await prisma.payment.create({ data: { type: "MEMBERSHIP", referenceId: m.id, userId: m.userId, amountCents: m.amountCents, status: "SUCCEEDED", provider: "manual" } });
  refresh();
}

export async function markMessageReadAction(formData: FormData) {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id: str(formData, "id") }, data: { read: true } });
  refresh();
}
