"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { adminCreateMeme } from "@/lib/admin-actions";

const input =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-accent";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-60"
    >
      {pending ? "Subiendo…" : "Subir meme"}
    </button>
  );
}

export function AdminMemeForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setPreview(null);
    setDims(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen supera 5 MB.");
      e.target.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
      setPreview(url);
    };
    img.src = url;
  }

  return (
    <form action={adminCreateMeme} className="space-y-3">
      <input
        type="text"
        name="title"
        maxLength={140}
        placeholder="Texto del meme (opcional)"
        className={input}
      />
      <input
        type="file"
        name="image"
        accept="image/png,image/jpeg,image/gif,image/webp"
        required
        onChange={onPick}
        className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-800"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {dims && (
        <>
          <input type="hidden" name="imageWidth" value={dims.w} />
          <input type="hidden" name="imageHeight" value={dims.h} />
        </>
      )}
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Vista previa"
          className="max-h-60 w-full rounded-lg border border-neutral-200 object-contain"
        />
      )}
      <p className="text-xs text-neutral-500">PNG, JPG, GIF o WEBP. Máximo 5 MB.</p>
      <SubmitButton />
    </form>
  );
}
