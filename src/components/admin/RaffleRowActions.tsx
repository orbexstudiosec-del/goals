"use client";

import { useTransition } from "react";
import { drawRaffle, deleteRaffle } from "@/lib/pronosticos-admin";

const btn = "rounded-md px-3 py-1.5 text-xs font-bold transition disabled:opacity-50";

export function RaffleRowActions({ id, drawn }: { id: string; drawn: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1.5">
      {!drawn && (
        <button
          disabled={pending}
          onClick={() => {
            if (confirm("¿Realizar el sorteo ahora? Se elegirá un ganador al azar ponderado por boletos."))
              start(async () => {
                try {
                  await drawRaffle(id);
                } catch (e) {
                  alert(e instanceof Error ? e.message : "No se pudo sortear.");
                }
              });
          }}
          className={`${btn} bg-green-600 text-white hover:bg-green-700`}
        >
          🎲 Sortear ganador
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("¿Borrar este sorteo?")) start(() => deleteRaffle(id));
        }}
        className={`${btn} bg-red-100 text-red-700 hover:bg-red-200`}
      >
        🗑
      </button>
    </div>
  );
}
