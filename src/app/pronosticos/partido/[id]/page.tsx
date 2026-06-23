import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getParticipant } from "@/lib/participant-auth";
import { PredictionForm } from "@/components/pronosticos/PredictionForm";
import { Flag } from "@/components/pronosticos/Flag";
import { Countdown } from "@/components/pronosticos/Countdown";
import { ShareMatchButton } from "@/components/pronosticos/ShareMatchButton";
import { siteConfig, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

function kickoffLabel(d: Date): string {
  return d.toLocaleString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) return {};

  const title = `${match.homeTeam} vs ${match.awayTeam} · Pronóstico Mundial 2026`;
  const description = `Pronostica el marcador de ${match.homeTeam} vs ${match.awayTeam}, acumula boletos y participa en el sorteo de Goals Ec. ⚽ ${match.league ?? "Mundial 2026"}`;
  const url = absoluteUrl(`/pronosticos/partido/${id}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function PartidoPage({ params }: { params: Params }) {
  const { id } = await params;

  const [match, me] = await Promise.all([
    prisma.match.findUnique({ where: { id } }),
    getParticipant(),
  ]);

  if (!match) notFound();

  const [myPred, predCount] = await Promise.all([
    me
      ? prisma.prediction.findUnique({
          where: { matchId_participantId: { matchId: id, participantId: me.id } },
        })
      : null,
    prisma.prediction.count({ where: { matchId: id } }),
  ]);

  const now = new Date();
  const isOpen = match.status === "OPEN" && match.kickoff > now;
  const shareUrl = absoluteUrl(`/pronosticos/partido/${id}`);
  const shareTitle = `Pronostica ${match.homeTeam} vs ${match.awayTeam} en Goals Ec ⚽`;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/pronosticos"
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-900"
      >
        ← Todos los partidos
      </Link>

      {/* Tarjeta del partido */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        {/* Cabecera */}
        <div className="flex items-center justify-between bg-neutral-950 px-4 py-3">
          <span className="text-xs font-black uppercase tracking-wide text-accent">
            {match.league ?? "Mundial 2026"}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              isOpen
                ? "bg-emerald-500/20 text-emerald-400"
                : match.status === "SETTLED"
                  ? "bg-neutral-600 text-neutral-300"
                  : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {isOpen ? "ABIERTO" : match.status === "SETTLED" ? "FINALIZADO" : "CERRADO"}
          </span>
        </div>

        {/* Equipos */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            {/* Local */}
            <div className="flex flex-1 flex-col items-center gap-2">
              <Flag name={match.homeTeam} className="h-16 w-24" />
              <span className="text-center text-sm font-bold text-neutral-800">{match.homeTeam}</span>
            </div>

            {/* Marcador / VS */}
            <div className="flex flex-col items-center gap-2">
              {match.status === "SETTLED" ? (
                <>
                  <span className="rounded-2xl bg-neutral-950 px-5 py-2.5 text-3xl font-black tabular-nums text-accent">
                    {match.homeScore} : {match.awayScore}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                    Resultado final
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black text-neutral-300">VS</span>
                  {isOpen && (
                    <Countdown kickoff={match.kickoff.toISOString()} />
                  )}
                </>
              )}
            </div>

            {/* Visitante */}
            <div className="flex flex-1 flex-col items-center gap-2">
              <Flag name={match.awayTeam} className="h-16 w-24" />
              <span className="text-center text-sm font-bold text-neutral-800">{match.awayTeam}</span>
            </div>
          </div>

          {/* Fecha */}
          <p className="mt-5 text-center text-sm capitalize text-neutral-500">
            🕒 {kickoffLabel(match.kickoff)}
          </p>

          {/* Contador de pronósticos */}
          {predCount > 0 && (
            <p className="mt-1 text-center text-xs text-neutral-400">
              {predCount} {predCount === 1 ? "persona ha" : "personas han"} pronosticado
            </p>
          )}
        </div>

        {/* Zona de pronóstico */}
        <div className="border-t border-neutral-100 px-6 pb-6 pt-4">
          {isOpen ? (
            me ? (
              <>
                <p className="mb-4 text-center text-sm font-bold text-neutral-600">
                  Tu pronóstico
                </p>
                <PredictionForm
                  matchId={match.id}
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  current={
                    myPred
                      ? { homeScore: myPred.homeScore, awayScore: myPred.awayScore }
                      : null
                  }
                />
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold text-neutral-700">
                  ¡Regístrate gratis y pronostica! 🎟️
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Acierta el marcador, acumula boletos y entra al sorteo.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Link
                    href="/pronosticos/registro"
                    className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 active:scale-95"
                  >
                    Crear cuenta
                  </Link>
                  <Link
                    href="/pronosticos/ingresar"
                    className="rounded-full bg-neutral-100 px-5 py-2.5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-200 active:scale-95"
                  >
                    Ingresar
                  </Link>
                </div>
              </div>
            )
          ) : match.status === "SETTLED" ? (
            myPred ? (
              <div className="text-center">
                <span
                  className={`inline-block rounded-full px-4 py-2 text-sm font-bold ${
                    myPred.points > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  Tu pronóstico: {myPred.homeScore}–{myPred.awayScore} · +{myPred.points} 🎟️
                </span>
              </div>
            ) : (
              <p className="text-center text-sm text-neutral-400">
                No hiciste un pronóstico para este partido.
              </p>
            )
          ) : (
            <p className="text-center text-sm text-neutral-400">
              Este partido ya no acepta pronósticos.
            </p>
          )}
        </div>
      </div>

      {/* Botón compartir */}
      <ShareMatchButton url={shareUrl} title={shareTitle} />

      {/* Reglas */}
      <div className="mt-5 rounded-2xl bg-neutral-50 px-4 py-3 text-center text-xs text-neutral-500">
        🎯 <b>Exacto</b> = 3 boletos &nbsp;·&nbsp; ✅ <b>Resultado</b> = 1 boleto &nbsp;·&nbsp; ❌ = 0
      </div>

      <div className="mt-4 text-center">
        <Link href="/pronosticos" className="text-sm text-neutral-500 underline hover:text-neutral-900">
          Ver todos los partidos
        </Link>
      </div>
    </div>
  );
}
