"use client";

import { useRef, useState } from "react";

export function ImageGalleryField() {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError(null);
    setUploading(true);
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data.error) throw new Error(data.error || "Error al subir");
          return data.url as string;
        }),
      );
      setImages((prev) => [...prev, ...results]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imágenes.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function copy(url: string) {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-600">Imágenes adicionales</span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded bg-neutral-900 px-3 py-1 text-xs font-bold text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {uploading ? "Subiendo…" : "+ Subir imágenes"}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={onPick}
        className="hidden"
      />
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      {images.length === 0 ? (
        <p className="text-xs text-neutral-400">
          Sube una o varias imágenes. Haz clic en la miniatura para copiar la URL y pegarla en el
          editor o en el botón 🖼 de la barra del contenido para insertarla directamente.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((url) => (
            <div key={url} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-20 w-full rounded-lg border border-neutral-200 object-cover"
              />
              <button
                type="button"
                onClick={() => copy(url)}
                className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
              >
                {copied === url ? "¡Copiado!" : "Copiar URL"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
