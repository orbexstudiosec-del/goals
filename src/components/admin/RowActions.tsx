"use client";

import { useTransition } from "react";
import {
  deleteComment,
  toggleArticlePublished,
  deleteArticle,
  deleteCategory,
} from "@/lib/admin-actions";

const btn = "rounded-md px-2.5 py-1 text-xs font-bold transition disabled:opacity-50";

export function CommentDeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("¿Borrar este comentario?")) start(() => deleteComment(id));
      }}
      className={`${btn} bg-red-100 text-red-700 hover:bg-red-200`}
    >
      🗑 Borrar
    </button>
  );
}

export function ArticleRowActions({ id, published }: { id: string; published: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={pending}
        onClick={() => start(() => toggleArticlePublished(id))}
        className={`${btn} ${published ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-green-100 text-green-800 hover:bg-green-200"}`}
      >
        {published ? "Despublicar" : "Publicar"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("¿Borrar este artículo?")) start(() => deleteArticle(id));
        }}
        className={`${btn} bg-red-100 text-red-700 hover:bg-red-200`}
      >
        🗑
      </button>
    </div>
  );
}

export function CategoryDeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("¿Borrar esta categoría?")) {
          start(async () => {
            try {
              await deleteCategory(id);
            } catch (e) {
              alert(e instanceof Error ? e.message : "No se pudo borrar.");
            }
          });
        }
      }}
      className={`${btn} bg-red-100 text-red-700 hover:bg-red-200`}
    >
      🗑 Borrar
    </button>
  );
}
