import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Reutiliza el hashing scrypt del módulo de admin.
export { hashPassword, verifyPassword } from "@/lib/auth";

const COOKIE = "gx_user";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días
const SECRET =
  process.env.PARTICIPANT_SESSION_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  "dev-insecure-secret-change-me";

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

function makeToken(participantId: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ id: participantId, exp })).toString("base64url");
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

export async function startParticipantSession(participantId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeToken(participantId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endParticipantSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export type ParticipantInfo = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  points: number;
};

/** Devuelve el participante autenticado o null (sin redirigir). */
export async function getParticipant(): Promise<ParticipantInfo | null> {
  const store = await cookies();
  const id = readToken(store.get(COOKIE)?.value);
  if (!id) return null;
  const p = await prisma.participant
    .findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, points: true },
    })
    .catch(() => null);
  return p;
}

/** Exige sesión de participante; si no, redirige a ingresar. */
export async function requireParticipant(): Promise<ParticipantInfo> {
  const p = await getParticipant();
  if (!p) redirect("/pronosticos/ingresar");
  return p;
}
