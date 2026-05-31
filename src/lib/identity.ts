import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const UID_COOKIE = "gx_uid";
const NAME_COOKIE = "gx_name";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Devuelve el token anónimo del navegador, creándolo (y seteando la cookie) si no existe.
 * Solo puede escribir la cookie dentro de Server Actions / Route Handlers.
 */
export async function getOrCreateAnonToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(UID_COOKIE)?.value;
  if (existing) return existing;

  const token = randomUUID();
  store.set(UID_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return token;
}

/** Lee el token anónimo sin crearlo (para vistas de solo lectura). */
export async function getAnonToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(UID_COOKIE)?.value ?? null;
}

/** Apodo recordado por el navegador (cookie no httpOnly). */
export async function getNickname(): Promise<string> {
  const store = await cookies();
  return store.get(NAME_COOKIE)?.value ?? "";
}

/** Recuerda el apodo elegido para precargarlo la próxima vez. */
export async function rememberNickname(name: string): Promise<void> {
  const clean = displayName(name);
  const store = await cookies();
  store.set(NAME_COOKIE, clean, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
}

/** Normaliza un apodo: vacío → "Anónimo", recortado a 40 caracteres. */
export function displayName(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim().slice(0, 40);
  return trimmed.length > 0 ? trimmed : "Anónimo";
}
