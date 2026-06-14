import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Convierte un teléfono ecuatoriano a enlace de WhatsApp (wa.me). */
function waLink(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = "593" + digits.slice(1);
  else if (digits.length === 9) digits = "593" + digits; // sin 0 inicial
  return `https://wa.me/${digits}`;
}

export default async function AdminJugadores() {
  const players = await prisma.participant.findMany({
    orderBy: [{ points: "desc" }, { createdAt: "asc" }],
    take: 500,
    include: {
      _count: { select: { predictions: true } },
      predictions: {
        orderBy: { createdAt: "desc" },
        include: { match: { select: { homeTeam: true, awayTeam: true, status: true } } },
      },
    },
  });

  const totalTickets = players.reduce((s, p) => s + p.points, 0);

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900">Jugadores</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {players.length} registrado(s) · {totalTickets} boleto(s) en total
      </p>

      {players.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
          Aún no hay jugadores registrados.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {players.map((p, i) => {
            const wa = p.phone ? waLink(p.phone) : null;
            return (
              <div key={p.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-base font-black text-neutral-900">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-bold text-neutral-900">
                        <span className="mr-1 text-neutral-400">#{i + 1}</span>
                        {p.name}
                      </p>
                      <p className="text-sm text-neutral-600">
                        <a href={`mailto:${p.email}`} className="hover:underline">
                          {p.email}
                        </a>
                      </p>
                      <p className="text-sm text-neutral-600">
                        {p.phone ? (
                          wa ? (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-green-700 hover:underline"
                            >
                              📱 {p.phone} · WhatsApp
                            </a>
                          ) : (
                            <span>📱 {p.phone}</span>
                          )
                        ) : (
                          <span className="text-neutral-400">Sin teléfono</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-neutral-900">{p.points} 🎟️</p>
                    <p className="text-xs text-neutral-500">{p._count.predictions} pronóstico(s)</p>
                    <p className="text-xs text-neutral-400">Registrado {formatDate(p.createdAt)}</p>
                  </div>
                </div>

                {p.predictions.length > 0 && (
                  <details className="mt-3 border-t border-neutral-100 pt-2">
                    <summary className="cursor-pointer text-xs font-bold text-neutral-600">
                      Ver pronósticos ({p.predictions.length})
                    </summary>
                    <ul className="mt-2 space-y-1 text-sm text-neutral-700">
                      {p.predictions.map((pr) => (
                        <li key={pr.id} className="flex items-center justify-between gap-2">
                          <span>
                            {pr.match.homeTeam}{" "}
                            <b className="tabular-nums">
                              {pr.homeScore}–{pr.awayScore}
                            </b>{" "}
                            {pr.match.awayTeam}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {pr.match.status === "SETTLED" ? `+${pr.points} 🎟️` : "pendiente"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
