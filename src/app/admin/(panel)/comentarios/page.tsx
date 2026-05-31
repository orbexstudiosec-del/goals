import { prisma } from "@/lib/prisma";
import { formatRelativeDate } from "@/lib/site";
import { CommentDeleteButton } from "@/components/admin/RowActions";

export const dynamic = "force-dynamic";

export default async function AdminComentarios() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { post: { select: { title: true, type: true, slug: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900">Comentarios</h1>
      <p className="mt-1 text-sm text-neutral-500">{comments.length} comentario(s) recientes</p>

      <div className="mt-5 space-y-3">
        {comments.length === 0 && (
          <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
            No hay comentarios todavía.
          </p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-700">{c.authorName}</span>
              <span aria-hidden>·</span>
              <span>{formatRelativeDate(c.createdAt)}</span>
              <span aria-hidden>·</span>
              <span className="truncate">
                en <em>{c.post.title || c.post.type}</em>
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-neutral-800">{c.body}</p>
            <div className="mt-3">
              <CommentDeleteButton id={c.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
