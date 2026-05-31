"use client";

import { useTransition } from "react";
import { logout } from "@/lib/admin-actions";

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(() => logout())}
      disabled={pending}
      className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:opacity-60"
    >
      {pending ? "Saliendo…" : "↩ Cerrar sesión"}
    </button>
  );
}
