import { prisma } from "@/lib/prisma";
import { createMatch, settleMatch } from "@/lib/pronosticos-admin";
import { MatchRowActions } from "@/components/admin/MatchRowActions";

export const dynamic = "force-dynamic";

const input =
  "rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-accent";
const scoreInput =
  "w-14 rounded-lg border border-neutral-300 px-2 py-1.5 text-center text-sm font-bold outline-none focus:border-neutral-900";

function fmt(d: Date): string {
  return d.toLocaleString("es-EC", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPronosticos() {
  const matches = await prisma.match.findMany({
    orderBy: { kickoff: "desc" },
    take: 100,
    include: { _count: { select: { predictions: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black text-neutral-900">Mundial 2026 · Partidos</h1>
        <a
          href="/admin/jugadores"
          className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-neutral-800"
        >
          👥 Ver jugadores
        </a>
      </div>
      <p className="mt-1 text-sm text-neutral-500">{matches.length} partido(s)</p>

      {/* Crear partido */}
      <details open className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold text-neutral-800">
          ➕ Crear partido
        </summary>
        <form action={createMatch} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold text-neutral-600">
            Local
            <input name="homeTeam" required placeholder="Ej. Barcelona SC" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-neutral-600">
            Visitante
            <input name="awayTeam" required placeholder="Ej. Emelec" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-neutral-600">
            Fase / Grupo
            <input name="league" defaultValue="Mundial 2026" placeholder="Grupo A, Octavos…" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-neutral-600">
            Fecha y hora
            <input type="datetime-local" name="kickoff" required className={input} />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            Crear
          </button>
        </form>
      </details>

      {/* Lista de partidos */}
      <div className="mt-5 space-y-3">
        {matches.length === 0 && (
          <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
            Aún no hay partidos.
          </p>
        )}
        {matches.map((m) => {
          const settled = m.status === "SETTLED";
          const closed = m.kickoff.getTime() <= Date.now();
          return (
            <div key={m.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    {m.league && (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-bold uppercase">
                        {m.league}
                      </span>
                    )}
                    <span>🕒 {fmt(m.kickoff)}</span>
                    <span aria-hidden>·</span>
                    <span>{m._count.predictions} pronóstico(s)</span>
                    {settled ? (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 font-bold text-green-800">
                        LIQUIDADO
                      </span>
                    ) : closed ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 font-bold text-amber-800">
                        CERRADO
                      </span>
                    ) : (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-800">
                        ABIERTO
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-bold text-neutral-900">
                    {m.homeTeam} <span className="text-neutral-400">vs</span> {m.awayTeam}
                    {settled && (
                      <span className="ml-2 text-neutral-900">
                        ({m.homeScore}–{m.awayScore})
                      </span>
                    )}
                  </p>
                </div>
                <MatchRowActions id={m.id} settled={settled} />
              </div>

              {/* Cargar / editar resultado */}
              {!settled && (
                <form action={settleMatch} className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
                  <input type="hidden" name="matchId" value={m.id} />
                  <span className="text-xs font-bold text-neutral-500">Resultado:</span>
                  <input type="number" name="homeScore" min={0} required className={scoreInput} aria-label="Goles local" />
                  <span className="text-neutral-400">–</span>
                  <input type="number" name="awayScore" min={0} required className={scoreInput} aria-label="Goles visitante" />
                  <button
                    type="submit"
                    className="rounded-lg bg-accent px-4 py-1.5 text-sm font-bold text-neutral-900 transition hover:bg-accent-600"
                  >
                    Liquidar y repartir boletos
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
