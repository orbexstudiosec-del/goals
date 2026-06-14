"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function num(value: FormDataEntryValue | null): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Puntos de un pronóstico: marcador exacto = 3, resultado (1X2) correcto = 1, si no 0. */
function scorePrediction(
  predH: number,
  predA: number,
  realH: number,
  realA: number,
): number {
  if (predH === realH && predA === realA) return 3;
  const sign = (h: number, a: number) => Math.sign(h - a);
  if (sign(predH, predA) === sign(realH, realA)) return 1;
  return 0;
}

// ─────────────────────────────────────────── Partidos

export async function createMatch(formData: FormData): Promise<void> {
  await requireAdmin();
  const homeTeam = String(formData.get("homeTeam") ?? "").trim();
  const awayTeam = String(formData.get("awayTeam") ?? "").trim();
  const league = String(formData.get("league") ?? "").trim() || null;
  const kickoffRaw = String(formData.get("kickoff") ?? "").trim();

  if (!homeTeam || !awayTeam) throw new Error("Faltan los equipos.");
  const kickoff = new Date(kickoffRaw);
  if (isNaN(kickoff.getTime())) throw new Error("Fecha/hora inválida.");

  await prisma.match.create({
    data: { homeTeam, awayTeam, league, kickoff },
  });

  revalidatePath("/admin/pronosticos");
  revalidatePath("/pronosticos");
}

export async function deleteMatch(matchId: string): Promise<void> {
  await requireAdmin();
  await prisma.match.delete({ where: { id: matchId } }).catch(() => null);
  // Recalcula puntos de todos por si el partido ya estaba liquidado.
  await recomputeAllPoints();
  revalidatePath("/admin/pronosticos");
  revalidatePath("/pronosticos");
}

/** Carga el resultado, reparte puntos y recalcula boletos de los afectados. */
export async function settleMatch(formData: FormData): Promise<void> {
  await requireAdmin();
  const matchId = String(formData.get("matchId") ?? "");
  const homeScore = num(formData.get("homeScore"));
  const awayScore = num(formData.get("awayScore"));

  if (homeScore === null || awayScore === null || homeScore < 0 || awayScore < 0) {
    throw new Error("Ingresa un marcador válido.");
  }

  const predictions = await prisma.prediction.findMany({
    where: { matchId },
    select: { id: true, homeScore: true, awayScore: true, participantId: true },
  });

  await prisma.$transaction([
    prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, status: "SETTLED" },
    }),
    ...predictions.map((p) =>
      prisma.prediction.update({
        where: { id: p.id },
        data: { points: scorePrediction(p.homeScore, p.awayScore, homeScore, awayScore) },
      }),
    ),
  ]);

  // Recalcula los boletos (puntos) de los participantes afectados.
  const affected = [...new Set(predictions.map((p) => p.participantId))];
  await Promise.all(affected.map(recomputeParticipantPoints));

  revalidatePath("/admin/pronosticos");
  revalidatePath("/pronosticos");
}

/** Reabre un partido para volver a admitir pronósticos (revierte puntos). */
export async function reopenMatch(matchId: string): Promise<void> {
  await requireAdmin();
  const predictions = await prisma.prediction.findMany({
    where: { matchId },
    select: { participantId: true },
  });
  await prisma.$transaction([
    prisma.match.update({
      where: { id: matchId },
      data: { status: "OPEN", homeScore: null, awayScore: null },
    }),
    prisma.prediction.updateMany({ where: { matchId }, data: { points: 0 } }),
  ]);
  const affected = [...new Set(predictions.map((p) => p.participantId))];
  await Promise.all(affected.map(recomputeParticipantPoints));
  revalidatePath("/admin/pronosticos");
  revalidatePath("/pronosticos");
}

async function recomputeParticipantPoints(participantId: string): Promise<void> {
  const agg = await prisma.prediction.aggregate({
    where: { participantId },
    _sum: { points: true },
  });
  await prisma.participant.update({
    where: { id: participantId },
    data: { points: agg._sum.points ?? 0 },
  });
}

async function recomputeAllPoints(): Promise<void> {
  const grouped = await prisma.prediction.groupBy({
    by: ["participantId"],
    _sum: { points: true },
  });
  const map = new Map(grouped.map((g) => [g.participantId, g._sum.points ?? 0]));
  const participants = await prisma.participant.findMany({ select: { id: true } });
  await Promise.all(
    participants.map((p) =>
      prisma.participant.update({
        where: { id: p.id },
        data: { points: map.get(p.id) ?? 0 },
      }),
    ),
  );
}

// ─────────────────────────────────────────── Sorteos

export async function createRaffle(formData: FormData): Promise<void> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const prize = String(formData.get("prize") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!title || !prize) throw new Error("Falta el título o el premio.");

  await prisma.raffle.create({ data: { title, prize, description } });
  revalidatePath("/admin/sorteos");
  revalidatePath("/pronosticos");
}

export async function deleteRaffle(raffleId: string): Promise<void> {
  await requireAdmin();
  await prisma.raffle.delete({ where: { id: raffleId } }).catch(() => null);
  revalidatePath("/admin/sorteos");
  revalidatePath("/pronosticos");
}

/**
 * Realiza el sorteo: elige un ganador al azar ponderado por boletos
 * (cada punto acumulado = un boleto).
 */
export async function drawRaffle(raffleId: string): Promise<void> {
  await requireAdmin();

  const raffle = await prisma.raffle.findUnique({ where: { id: raffleId } });
  if (!raffle || raffle.status === "DRAWN") return;

  const entrants = await prisma.participant.findMany({
    where: { points: { gt: 0 } },
    select: { id: true, name: true, points: true },
  });

  const totalTickets = entrants.reduce((sum, e) => sum + e.points, 0);
  if (totalTickets === 0) {
    throw new Error("Aún no hay participantes con boletos para sortear.");
  }

  // Selección ponderada por boletos.
  let pick = randomInt(totalTickets); // 0 .. totalTickets-1
  let winner = entrants[0];
  for (const e of entrants) {
    if (pick < e.points) {
      winner = e;
      break;
    }
    pick -= e.points;
  }

  await prisma.raffle.update({
    where: { id: raffleId },
    data: {
      status: "DRAWN",
      winnerId: winner.id,
      winnerName: winner.name,
      winnerTickets: winner.points,
      totalTickets,
      drawnAt: new Date(),
    },
  });

  revalidatePath("/admin/sorteos");
  revalidatePath("/pronosticos");
}
