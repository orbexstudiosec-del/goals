"use client";

import { useTransition } from "react";
import { setPostStatus, togglePinned, deletePost } from "@/lib/admin-actions";
import type { ModStatus } from "@prisma/client";

const btn =
  "rounded-md px-2.5 py-1 text-xs font-bold transition disabled:opacity-50";

export function PostModButtons({
  id,
  status,
  pinned,
}: {
  id: string;
  status: ModStatus;
  pinned: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status !== "PUBLISHED" && (
        <button
          disabled={pending}
          onClick={() => start(() => setPostStatus(id, "PUBLISHED"))}
          className={`${btn} bg-green-100 text-green-800 hover:bg-green-200`}
        >
          ✓ Aprobar
        </button>
      )}
      {status !== "REMOVED" && (
        <button
          disabled={pending}
          onClick={() => start(() => setPostStatus(id, "REMOVED"))}
          className={`${btn} bg-amber-100 text-amber-800 hover:bg-amber-200`}
        >
          ⦸ Ocultar
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => start(() => togglePinned(id))}
        className={`${btn} ${pinned ? "bg-accent text-neutral-900" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"}`}
      >
        📌 {pinned ? "Fijado" : "Fijar"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("¿Borrar esta publicación de forma permanente?")) {
            start(() => deletePost(id));
          }
        }}
        className={`${btn} bg-red-100 text-red-700 hover:bg-red-200`}
      >
        🗑 Borrar
      </button>
    </div>
  );
}
