import { prisma } from "@/lib/prisma";
import { createRaffle } from "@/lib/pronosticos-admin";
import { RaffleRowActions } from "@/components/admin/RaffleRowActions";
import { formatDate } from "@/lib/site";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-accent";

const STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  CLOSED: "bg-amber-100 text-amber-800",
  DRAWN: "bg-green-100 text-green-800",
};

export default async function AdminSorteos() {
  const [raffles, eligible, totalTickets] = await Promise.all([
    prisma.raffle.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.participant.count({ where: { points: { gt: 0 } } }),
    prisma.participant.aggregate({ _sum: { points: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900">Sorteos</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {eligible} participante(s) con boletos · {totalTickets._sum.points ?? 0} boleto(s) en juego
      </p>

      {/* Crear sorteo */}
      <details open className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold text-neutral-800">🎁 Crear sorteo</summary>
        <form action={createRaffle} className="mt-3 grid max-w-lg gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold text-neutral-600">
            Título
            <input name="title" required placeholder="Ej. Sorteo camiseta de la Tri" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-neutral-600">
            Premio
            <input name="prize" required placeholder="Ej. Camiseta oficial + entradas" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-neutral-600">
            Descripción (opcional)
            <textarea name="description" rows={2} className={input} />
          </label>
          <button
            type="submit"
            className="justify-self-start rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            Crear sorteo
          </button>
        </form>
      </details>

      {/* Lista */}
      <div className="mt-5 space-y-3">
        {raffles.length === 0 && (
          <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
            Aún no hay sorteos.
          </p>
        )}
        {raffles.map((r) => (
          <div key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`rounded px-1.5 py-0.5 font-bold ${STATUS_BADGE[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <h3 className="mt-1 font-black text-neutral-900">{r.title}</h3>
                <p className="text-sm font-bold text-neutral-700">Premio: {r.prize}</p>
                {r.description && <p className="mt-1 text-sm text-neutral-600">{r.description}</p>}
                {r.status === "DRAWN" && r.winnerName && (
                  <p className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-800">
                    🏆 Ganador: {r.winnerName} — con {r.winnerTickets} boleto(s) de {r.totalTickets}
                    {r.drawnAt && <span className="font-normal"> · {formatDate(r.drawnAt)}</span>}
                  </p>
                )}
              </div>
              <RaffleRowActions id={r.id} drawn={r.status === "DRAWN"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
