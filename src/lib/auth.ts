import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";

const COOKIE_NAME = "cdb_session";
const SESSION_DAYS = 30;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET no está configurado (mínimo 16 caracteres).");
  }
  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Lee la sesión desde la cookie (sin tocar la base de datos). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

/** Usuario actual con datos frescos de la base de datos. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, phone: true, isFirefighter: true, createdAt: true },
  });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return user!;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    const { redirect } = await import("next/navigation");
    if (!user) redirect("/login?next=/admin");
    const staff = await prisma.user.findUnique({ where: { id: user!.id }, select: { managedSectionId: true } });
    redirect(staff?.managedSectionId ? "/admin/eventos" : "/cuenta");
  }
  return user!;
}

/**
 * Personal con acceso al panel: administradores globales y responsables de sección.
 * Devuelve el usuario con su sección gestionada (si la tiene).
 */
export async function requireStaff() {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login?next=/admin");
  }
  const user = await prisma.user.findUnique({
    where: { id: session!.id },
    select: { id: true, name: true, email: true, role: true, managedSectionId: true, managedSection: { select: { id: true, name: true, slug: true } } },
  });
  if (!user || (user.role !== "ADMIN" && !user.managedSectionId)) {
    const { redirect } = await import("next/navigation");
    redirect("/cuenta");
  }
  return user!;
}

export type StaffUser = Awaited<ReturnType<typeof requireStaff>>;

export const isAdmin = (u: { role: Role }) => u.role === "ADMIN";

/** Un responsable de sección solo puede tocar contenidos de su sección. */
export function canManageSection(u: StaffUser, sectionId: string | null | undefined) {
  return isAdmin(u) || (Boolean(u.managedSectionId) && u.managedSectionId === sectionId);
}
