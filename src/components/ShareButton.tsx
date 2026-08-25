"use client";

import { useState } from "react";

const SHARE_LINKS = (url: string, text: string) => [
  { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${url}`, bg: "bg-[#1877F2]" },
  { label: "WhatsApp", href: `https://wa.me/?text=${text}%20${url}`, bg: "bg-[#25D366]" },
  { label: "X", href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`, bg: "bg-black" },
  { label: "Telegram", href: `https://t.me/share/url?url=${url}&text=${text}`, bg: "bg-[#0088cc]" },
];

/** Botón de compartir: usa el selector nativo del dispositivo si existe (navigator.share); si no, muestra los enlaces por red. */
export function ShareButton({ url, title }: { url: string; title: string }) {
  const [showFallback, setShowFallback] = useState(false);

  async function handleClick() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Usuario canceló el selector nativo.
      }
      return;
    }
    setShowFallback((v) => !v);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-neutral-900 hover:bg-neutral-200"
      >
        ↗ Compartir
      </button>

      {showFallback && (
        <div className="absolute left-0 top-full z-10 mt-2 flex w-max flex-wrap gap-1.5 rounded-xl bg-neutral-800 p-2 shadow-lg">
          {SHARE_LINKS(encodedUrl, encodedText).map((b) => (
            <a
              key={b.label}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowFallback(false)}
              className={`rounded-full px-3 py-1.5 text-sm font-bold text-white hover:opacity-90 ${b.bg}`}
            >
              {b.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
