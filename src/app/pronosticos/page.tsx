import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getParticipant } from "@/lib/participant-auth";
import { formatDate } from "@/lib/site";
import { PredictionForm } from "@/components/pronosticos/PredictionForm";
import { PLogoutButton } from "@/components/pronosticos/LogoutButton";
import { Countdown } from "@/components/pronosticos/Countdown";
import { Flag } from "@/components/pronosticos/Flag";

export const metadata: Metadata = {
  title: "Pronósticos Mundial 2026",
  description:
    "Pronostica los partidos del Mundial 2026, acumula boletos y participa en los sorteos de Goals Ec.",
};

export const dynamic = "force-dynamic";

function kickoffLabel(d: Date): string {
  return d.toLocaleString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PronosticosPage() {
  const me = await getParticipant();
  const now = new Date();

  const [activeRaffle, lastWinner, upcoming, settled, standings] = await Promise.all([
    prisma.raffle.findFirst({
      where: { status: { in: ["OPEN", "CLOSED"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.raffle.findFirst({
      where: { status: "DRAWN" },
      orderBy: { drawnAt: "desc" },
    }),
    prisma.match.findMany({
      where: { status: "OPEN", kickoff: { gt: now } },
      orderBy: { kickoff: "asc" },
      take: 30,
    }),
    prisma.match.findMany({
      where: { status: "SETTLED" },
      orderBy: { kickoff: "desc" },
      take: 10,
    }),
    prisma.participant.findMany({
      orderBy: [{ points: "desc" }, { createdAt: "asc" }],
      take: 10,
      select: { id: true, name: true, points: true },
    }),
  ]);

  const matchIds = [...upcoming, ...settled].map((m) => m.id);
  const myPreds = me
    ? await prisma.prediction.findMany({
        where: { participantId: me.id, matchId: { in: matchIds } },
      })
    : [];
  const predByMatch = new Map(myPreds.map((p) => [p.matchId, p]));
  const maxPoints = Math.max(1, ...standings.map((s) => s.points));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* ── Hero ── */}
      <header className="relative mb-6 overflow-hidden rounded-3xl bg-neutral-950 px-6 py-8 text-center shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-accent/10 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-black uppercase tracking-wider text-neutral-900">
            <Flag name="Ecuador" className="h-3.5 w-5" /> Mundial 2026
          </span>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-4xl">
            Pronostica a <span className="text-accent">La Tri</span> ⚽
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-300">
            Acierta los marcadores, suma boletos 🎟️ y participa en los sorteos de Goals Ec.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/10 px-3 py-1 text-white">
              🎯 Exacto = 3 boletos
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-white">
              ✅ Resultado = 1 boleto
            </span>
          </div>
        </div>
      </header>

      {/* ── Sorteo activo ── */}
      {activeRaffle && (
        <section className="relative mb-6 overflow-hidden rounded-2xl border-2 border-accent bg-gradient-to-br from-accent-50 to-accent-100 p-5">
          <div className="pointer-events-none absolute -right-6 -top-6 text-7xl opacity-20">🎁</div>
          <p className="text-xs font-black uppercase tracking-wide text-accent-700">
            🎁 Sorteo activo
          </p>
          <h2 className="mt-1 text-xl font-black text-neutral-900">{activeRaffle.title}</h2>
          <p className="mt-1 font-bold text-neutral-800">🏆 Premio: {activeRaffle.prize}</p>
          {activeRaffle.description && (
            <p className="mt-1 text-sm text-neutral-700">{activeRaffle.description}</p>
          )}
        </section>
      )}

      {/* ── Último ganador ── */}
      {lastWinner?.winnerName && (
        <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
          🏆 <b>{lastWinner.winnerName}</b> ganó “{lastWinner.title}” ({lastWinner.prize})
          {lastWinner.drawnAt && (
            <span className="text-neutral-500"> · {formatDate(lastWinner.drawnAt)}</span>
          )}
        </section>
      )}

      {/* ── Estado de la cuenta ── */}
      {me ? (
        <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl font-black text-neutral-900">
              {me.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-neutral-500">Hola, {me.name} 👋</p>
              <p className="text-lg font-black text-neutral-900">
                {me.points} boleto{me.points === 1 ? "" : "s"} 🎟️
              </p>
            </div>
          </div>
          <PLogoutButton />
        </section>
      ) : (
        <section className="mb-6 rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-5 text-center">
          <p className="text-lg font-black text-neutral-900">
            🎟️ Regístrate y participa en el sorteo
          </p>
          <p className="mt-1 text-sm text-neutral-600">Es gratis y toma menos de un minuto.</p>
          <div className="mt-3 flex justify-center gap-3">
            <Link
              href="/pronosticos/registro"
              className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 active:scale-95"
            >
              Crear cuenta
            </Link>
            <Link
              href="/pronosticos/ingresar"
              className="rounded-full bg-neutral-100 px-6 py-2.5 text-sm font-bold text-neutral-800 transition hover:bg-neutral-200 active:scale-95"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>
      )}

      {/* ── Próximos partidos ── */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-neutral-900">
          📅 Próximos partidos
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
            No hay partidos abiertos por ahora. ¡Vuelve pronto! ⚽
          </p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((m) => {
              const pred = predByMatch.get(m.id);
              return (
                <div
                  key={m.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                    <div className="flex items-center gap-2">
                      {m.league && (
                        <span className="rounded-full bg-neutral-900 px-2 py-0.5 font-bold uppercase text-accent">
                          {m.league}
                        </span>
                      )}
                      <span className="capitalize">🕒 {kickoffLabel(m.kickoff)}</span>
                    </div>
                    <Countdown kickoff={m.kickoff.toISOString()} />
                  </div>

                  {me ? (
                    <PredictionForm
                      matchId={m.id}
                      homeTeam={m.homeTeam}
                      awayTeam={m.awayTeam}
                      current={pred ? { homeScore: pred.homeScore, awayScore: pred.awayScore } : null}
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-4 py-2">
                      <span className="flex items-center gap-2 text-base font-bold text-neutral-800">
                        <Flag name={m.homeTeam} className="h-7 w-10" /> {m.homeTeam}
                      </span>
                      <span className="text-sm font-black text-neutral-300">VS</span>
                      <span className="flex items-center gap-2 text-base font-bold text-neutral-800">
                        {m.awayTeam} <Flag name={m.awayTeam} className="h-7 w-10" />
                      </span>
                    </div>
                  )}
                  {!me && (
                    <p className="mt-2 text-center text-xs text-neutral-500">
                      <Link href="/pronosticos/registro" className="font-bold text-neutral-900 underline">
                        Regístrate
                      </Link>{" "}
                      para enviar tu pronóstico.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Resultados ── */}
      {settled.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-neutral-900">
            ✅ Resultados
          </h2>
          <div className="space-y-3">
            {settled.map((m) => {
              const pred = predByMatch.get(m.id);
              return (
                <div key={m.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="flex items-center justify-center gap-3">
                    <span className="flex flex-1 items-center justify-end gap-2 text-sm font-bold text-neutral-800">
                      {m.homeTeam} <Flag name={m.homeTeam} className="h-6 w-9" />
                    </span>
                    <span className="rounded-lg bg-neutral-900 px-3 py-1 text-lg font-black tabular-nums text-accent">
                      {m.homeScore} : {m.awayScore}
                    </span>
                    <span className="flex flex-1 items-center gap-2 text-sm font-bold text-neutral-800">
                      <Flag name={m.awayTeam} className="h-6 w-9" /> {m.awayTeam}
                    </span>
                  </div>
                  {pred && (
                    <div className="mt-2 text-center">
                      <span
                        className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
                          pred.points > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        Tu pronóstico: {pred.homeScore}–{pred.awayScore} · +{pred.points} 🎟️
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Tabla de boletos ── */}
      {standings.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-neutral-900">
            🏅 Tabla de boletos
          </h2>
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {standings.map((p, i) => {
              const isMe = me && p.id === me.id;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i > 0 ? "border-t border-neutral-100" : ""
                  } ${isMe ? "bg-accent-50" : ""}`}
                >
                  <span className="w-6 text-center text-base font-black text-neutral-400">
                    {medals[i] ?? i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${isMe ? "font-black" : "font-semibold"} text-neutral-900`}>
                      {p.name} {isMe && <span className="text-xs text-accent-700">(tú)</span>}
                    </p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.round((p.points / maxPoints) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-black text-neutral-900">
                    {p.points} 🎟️
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
