"use client";

import { useTransition } from "react";
import { deleteMatch, reopenMatch } from "@/lib/pronosticos-admin";

const btn = "rounded-md px-2.5 py-1 text-xs font-bold transition disabled:opacity-50";

export function MatchRowActions({ id, settled }: { id: string; settled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1.5">
      {settled && (
        <button
          disabled={pending}
          onClick={() => {
            if (confirm("¿Reabrir el partido? Se borrarán los boletos repartidos por este partido."))
              start(() => reopenMatch(id));
          }}
          className={`${btn} bg-amber-100 text-amber-800 hover:bg-amber-200`}
        >
          ↺ Reabrir
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("¿Borrar este partido y todos sus pronósticos?"))
            start(() => deleteMatch(id));
        }}
        className={`${btn} bg-red-100 text-red-700 hover:bg-red-200`}
      >
        🗑
      </button>
    </div>
  );
}
