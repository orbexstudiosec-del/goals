"use client";

import { useState } from "react";

export function ShareMatchButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url, text: title });
        return;
      } catch {
        // usuario canceló o no está soportado
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // no se pudo copiar
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white py-3 text-sm font-bold text-neutral-700 shadow-sm transition hover:border-neutral-400 hover:text-neutral-900 active:scale-95"
    >
      {copied ? "¡Link copiado! 🔗" : "📤 Compartir este partido"}
    </button>
  );
}
