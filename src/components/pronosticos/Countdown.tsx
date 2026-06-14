"use client";

import { useEffect, useState } from "react";

function diffLabel(target: number, now: number): { text: string; soon: boolean; closed: boolean } {
  const ms = target - now;
  if (ms <= 0) return { text: "Cerrado", soon: false, closed: true };
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const soon = ms < 60 * 60 * 1000; // menos de 1h
  if (d > 0) return { text: `${d}d ${h}h`, soon, closed: false };
  if (h > 0) return { text: `${h}h ${m}m`, soon, closed: false };
  return { text: `${m}m ${sec}s`, soon, closed: false };
}

export function Countdown({ kickoff }: { kickoff: string }) {
  const target = new Date(kickoff).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Evita parpadeo de hidratación: hasta montar, muestra un guion.
  if (now === null) {
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-400">⏳ …</span>;
  }

  const { text, soon, closed } = diffLabel(target, now);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
        closed
          ? "bg-neutral-100 text-neutral-400"
          : soon
            ? "animate-pulse bg-red-100 text-red-700"
            : "bg-neutral-900 text-accent"
      }`}
    >
      {closed ? "🔒" : "⏳"} {closed ? "Cerrado" : `Cierra en ${text}`}
    </span>
  );
}
