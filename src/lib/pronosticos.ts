"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  startParticipantSession,
  endParticipantSession,
  getParticipant,
} from "@/lib/participant-auth";

type FormState = { error?: string } | null;

function clean(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

// ─────────────────────────────────────────── Registro

export async function registerParticipant(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = clean(formData.get("name"), 60);
  const email = clean(formData.get("email"), 120).toLowerCase();
  const phone = clean(formData.get("phone"), 30) || null;
  const password = String(formData.get("password") ?? "");

  if (!name || name.length < 2) return { error: "Ingresa tu nombre completo." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { error: "Ingresa un email válido." };
  if (password.length < 6)
    return { error: "La contraseña debe tener al menos 6 caracteres." };

  const exists = await prisma.participant.findUnique({
    where: { email },
    select: { id: true },
  });
  if (exists) return { error: "Ese email ya está registrado. Inicia sesión." };

  const participant = await prisma.participant.create({
    data: { name, email, phone, passwordHash: hashPassword(password) },
  });

  await startParticipantSession(participant.id);
  redirect("/pronosticos");
}

// ─────────────────────────────────────────── Login

export async function loginParticipant(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = clean(formData.get("email"), 120).toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.participant
    .findUnique({ where: { email } })
    .catch(() => null);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Email o contraseña incorrectos." };
  }

  await startParticipantSession(user.id);
  redirect("/pronosticos");
}

export async function logoutParticipant(): Promise<void> {
  await endParticipantSession();
  redirect("/pronosticos");
}

// ─────────────────────────────────────────── Enviar / actualizar pronóstico

export type PredictionState = { ok?: boolean; error?: string } | null;

export async function submitPrediction(
  _prev: PredictionState,
  formData: FormData,
): Promise<PredictionState> {
  const me = await getParticipant();
  if (!me) return { error: "Inicia sesión para pronosticar." };

  const matchId = String(formData.get("matchId") ?? "");
  const homeScore = Math.max(0, Math.min(99, Number(formData.get("homeScore"))));
  const awayScore = Math.max(0, Math.min(99, Number(formData.get("awayScore"))));

  if (!matchId || !Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
    return { error: "Marcador inválido." };
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { status: true, kickoff: true },
  });
  if (!match) return { error: "El partido no existe." };
  if (match.status !== "OPEN" || match.kickoff.getTime() <= Date.now()) {
    return { error: "Los pronósticos para este partido ya están cerrados." };
  }

  await prisma.prediction.upsert({
    where: { matchId_participantId: { matchId, participantId: me.id } },
    update: { homeScore, awayScore },
    create: { matchId, participantId: me.id, homeScore, awayScore },
  });

  revalidatePath("/pronosticos");
  return { ok: true };
}
