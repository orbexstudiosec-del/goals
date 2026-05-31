import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHmac,
} from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const COOKIE = "gx_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días
const SECRET = process.env.ADMIN_SESSION_SECRET || "dev-insecure-secret-change-me";

// ─────────────────────────────────────────── Contraseñas (scrypt)

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = scryptSync(password, salt, 64);
  return hashBuf.length === test.length && timingSafeEqual(hashBuf, test);
}

// ─────────────────────────────────────────── Sesión firmada (HMAC)

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

function makeToken(adminId: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ id: adminId, exp })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { id, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof id !== "string" || typeof exp !== "number") return null;
    if (exp < Math.floor(Date.now() / 1000)) return null;
    return id;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────── API de sesión

export async function startSession(adminId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeToken(adminId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export type AdminInfo = { id: string; name: string; email: string; role: string };

/** Devuelve el admin autenticado o null (sin redirigir). */
export async function getAdmin(): Promise<AdminInfo | null> {
  const store = await cookies();
  const id = readToken(store.get(COOKIE)?.value);
  if (!id) return null;
  const admin = await prisma.adminUser
    .findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true } })
    .catch(() => null);
  return admin;
}

/** Exige sesión de admin; si no, redirige a /admin/login. */
export async function requireAdmin(): Promise<AdminInfo> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Verifica credenciales y devuelve el admin si son válidas. */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<AdminInfo | null> {
  const user = await prisma.adminUser
    .findUnique({ where: { email: email.trim().toLowerCase() } })
    .catch(() => null);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
