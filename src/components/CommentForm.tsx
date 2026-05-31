"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { addComment } from "@/lib/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Enviando…" : label}
    </button>
  );
}

type Props = {
  postId: string;
  path: string;
  nickname?: string;
  parentId?: string;
  compact?: boolean;
  onDone?: () => void;
  label?: string;
  placeholder?: string;
};

export function CommentForm({
  postId,
  path,
  nickname = "",
  parentId,
  compact = false,
  onDone,
  label = "Comentar",
  placeholder = "Escribe un comentario…",
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addComment(formData);
        formRef.current?.reset();
        onDone?.();
      }}
      className={compact ? "mt-2 space-y-2" : "space-y-2"}
    >
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="path" value={path} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}

      {!compact && (
        <input
          type="text"
          name="authorName"
          defaultValue={nickname}
          maxLength={40}
          placeholder="Tu apodo (opcional)"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      )}
      {compact && <input type="hidden" name="authorName" value={nickname} />}

      <textarea
        name="body"
        required
        rows={compact ? 2 : 3}
        maxLength={2000}
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
      <div className="flex items-center gap-2">
        <SubmitButton label={label} />
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-800"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
