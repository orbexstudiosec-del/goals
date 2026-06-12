"use client";

import { useState } from "react";

export function CopyLinkField({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard no disponible */
    }
  }

  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
      />
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800"
      >
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
