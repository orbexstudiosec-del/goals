"use client";

import { useEffect, useState } from "react";

type Props = {
  version: string;
  title: string | null;
  body: string | null;
  image: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

export function SitePopup({ version, title, body, image, ctaLabel, ctaUrl }: Props) {
  const [open, setOpen] = useState(false);
  const storageKey = `popup-dismissed:${version}`;

  useEffect(() => {
    // Mostrar una vez por sesión; reaparece cuando cambia el contenido (version).
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {
      /* sessionStorage no disponible */
    }
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [storageKey]);

  function close() {
    setOpen(false);
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Aviso"}
      onClick={close}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-neutral-900 bg-white shadow-[6px_6px_0_#0a0a0a]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900/80 text-lg font-bold text-white hover:bg-neutral-900"
        >
          ×
        </button>

        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title ?? ""} className="max-h-60 w-full object-cover" />
        )}

        <div className="p-6 text-center">
          {title && <h2 className="text-xl font-black text-neutral-900">{title}</h2>}
          {body && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600">{body}</p>
          )}
          {ctaUrl && ctaLabel && (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="mt-5 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-neutral-900 ring-1 ring-accent-600 transition hover:bg-accent-600"
            >
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
