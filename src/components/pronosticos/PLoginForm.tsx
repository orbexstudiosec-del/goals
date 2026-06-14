"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginParticipant } from "@/lib/pronosticos";

const input =
  "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-accent";

export function PLoginForm() {
  const [state, action, pending] = useActionState(loginParticipant, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-neutral-700">Email</label>
        <input type="email" name="email" required autoFocus placeholder="tucorreo@gmail.com" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-neutral-700">Contraseña</label>
        <input type="password" name="password" required placeholder="••••••••" className={input} />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Iniciar sesión"}
      </button>

      <p className="text-center text-sm text-neutral-500">
        ¿No tienes cuenta?{" "}
        <Link href="/pronosticos/registro" className="font-bold text-neutral-900 underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
