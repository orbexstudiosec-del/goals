"use client";

import { useActionState, useState } from "react";
import { submitPrediction } from "@/lib/pronosticos";
import { Flag } from "@/components/pronosticos/Flag";

function Stepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-lg font-black text-neutral-700 transition hover:bg-neutral-200 active:scale-90"
        aria-label="Restar gol"
      >
        −
      </button>
      <span className="w-9 text-center text-3xl font-black tabular-nums text-neutral-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-lg font-black text-neutral-900 transition hover:bg-accent-600 active:scale-90"
        aria-label="Sumar gol"
      >
        +
      </button>
    </div>
  );
}

function Team({ name, align }: { name: string; align: "left" | "right" }) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 ${
        align === "left" ? "md:items-end" : "md:items-start"
      }`}
    >
      <Flag name={name} className="h-10 w-14" />
      <span className="truncate text-sm font-bold text-neutral-800" title={name}>
        {name}
      </span>
    </div>
  );
}

export function PredictionForm({
  matchId,
  homeTeam,
  awayTeam,
  current,
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  current: { homeScore: number; awayScore: number } | null;
}) {
  const [home, setHome] = useState(current?.homeScore ?? 0);
  const [away, setAway] = useState(current?.awayScore ?? 0);
  const [dirty, setDirty] = useState(false);
  const [state, action, pending] = useActionState(submitPrediction, null);

  const saved = state?.ok && !dirty;

  return (
    <form
      action={action}
      onSubmit={() => setDirty(false)}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="homeScore" value={home} />
      <input type="hidden" name="awayScore" value={away} />

      <div className="flex items-center justify-between gap-3">
        <Team name={homeTeam} align="left" />
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Stepper
              value={home}
              onChange={(v) => {
                setHome(v);
                setDirty(true);
              }}
            />
            <span className="text-xl font-black text-neutral-300">:</span>
            <Stepper
              value={away}
              onChange={(v) => {
                setAway(v);
                setDirty(true);
              }}
            />
          </div>
        </div>
        <Team name={awayTeam} align="right" />
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-neutral-900 px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95 disabled:opacity-60"
        >
          {pending
            ? "Guardando…"
            : current && !dirty
              ? "Pronóstico guardado · editar"
              : current
                ? "Actualizar pronóstico"
                : "Guardar pronóstico"}
        </button>
        {saved && (
          <span className="animate-pop text-sm font-bold text-green-600">¡Guardado! ✓</span>
        )}
        {state?.error && (
          <span className="text-sm font-bold text-red-600">{state.error}</span>
        )}
      </div>
    </form>
  );
}
