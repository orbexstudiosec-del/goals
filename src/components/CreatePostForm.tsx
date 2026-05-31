"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createMeme, createConfession, createNote } from "@/lib/actions";

type Tab = "MEME" | "CONFESSION" | "NOTE";

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "MEME", label: "Meme", emoji: "😂" },
  { key: "CONFESSION", label: "Confesión", emoji: "🤫" },
  { key: "NOTE", label: "Nota curiosa", emoji: "💡" },
];

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Publicando…" : label}
    </button>
  );
}

function NicknameInput({ defaultValue }: { defaultValue: string }) {
  return (
    <input
      type="text"
      name="authorName"
      defaultValue={defaultValue}
      maxLength={40}
      placeholder="Tu apodo (opcional — si lo dejas vacío serás Anónimo)"
      className={inputClass}
    />
  );
}

export function CreatePostForm({
  nickname = "",
  initialTab = "MEME",
}: {
  nickname?: string;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [preview, setPreview] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    setPreview(null);
    setDims(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFileError("La imagen supera 5 MB.");
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
    <div>
      <div className="mb-5 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
              tab === t.key
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <span aria-hidden className="mr-1">
              {t.emoji}
            </span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "MEME" && (
        <form action={createMeme} className="space-y-3">
          <NicknameInput defaultValue={nickname} />
          <input
            type="text"
            name="title"
            maxLength={140}
            placeholder="Texto del meme (opcional)"
            className={inputClass}
          />
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/gif,image/webp"
            required
            onChange={onPickImage}
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
          />
          {fileError && <p className="text-sm text-red-600">{fileError}</p>}
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
              className="max-h-80 w-full rounded-lg border border-neutral-200 object-contain"
            />
          )}
          <p className="text-xs text-neutral-500">
            Formatos: PNG, JPG, GIF o WEBP. Máximo 5 MB.
          </p>
          <SubmitButton label="Publicar meme" />
        </form>
      )}

      {tab === "CONFESSION" && (
        <form action={createConfession} className="space-y-3">
          <NicknameInput defaultValue={nickname} />
          <input
            type="text"
            name="title"
            maxLength={140}
            placeholder="Título (opcional)"
            className={inputClass}
          />
          <textarea
            name="body"
            required
            rows={7}
            maxLength={5000}
            placeholder="Cuéntalo todo… aquí nadie te juzga. (Es anónimo)"
            className={`${inputClass} resize-y`}
          />
          <p className="text-xs text-neutral-500">
            Tu confesión es anónima. No compartas datos que te identifiquen.
          </p>
          <SubmitButton label="Confesar" />
        </form>
      )}

      {tab === "NOTE" && (
        <form action={createNote} className="space-y-3">
          <NicknameInput defaultValue={nickname} />
          <input
            type="text"
            name="title"
            required
            maxLength={140}
            placeholder="Título de la nota curiosa"
            className={inputClass}
          />
          <textarea
            name="body"
            required
            rows={6}
            maxLength={3000}
            placeholder="Comparte ese dato curioso que poca gente conoce…"
            className={`${inputClass} resize-y`}
          />
          <SubmitButton label="Publicar nota" />
        </form>
      )}
    </div>
  );
}
