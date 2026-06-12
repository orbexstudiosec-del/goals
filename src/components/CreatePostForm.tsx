"use client";

import { useFormStatus } from "react-dom";
import { createConfession } from "@/lib/actions";

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

export function CreatePostForm({ nickname = "" }: { nickname?: string }) {
  return (
    <form action={createConfession} className="space-y-3">
      <input
        type="text"
        name="authorName"
        defaultValue={nickname}
        maxLength={40}
        placeholder="Tu apodo (opcional — si lo dejas vacío serás Anónimo)"
        className={inputClass}
      />
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
  );
}
