"use client";

import { useRef, useState } from "react";

const input =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-accent";
const label = "mb-1 block text-xs font-bold text-neutral-600";

export function CoverImageField({
  defaultValue,
  name = "coverImage",
  fieldLabel = "Imagen de portada",
}: {
  defaultValue?: string | null;
  name?: string;
  fieldLabel?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) setError(data.error || "No se pudo subir la imagen.");
      else if (data.url) setUrl(data.url);
    } catch {
      setError("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label className={label}>{fieldLabel}</label>
      <div className="flex gap-2">
        <input
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL o súbela desde tu equipo →"
          className={input}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {uploading ? "Subiendo…" : "Subir"}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={onPick}
        className="hidden"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Vista previa de portada"
          className="mt-2 max-h-40 rounded-lg border border-neutral-200 object-contain"
        />
      )}
    </div>
  );
}
