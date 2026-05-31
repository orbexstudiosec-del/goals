import Image from "next/image";
import Link from "next/link";
import { VoteButtons } from "@/components/VoteButtons";
import { formatRelativeDate } from "@/lib/site";
import type { PostListItem } from "@/lib/posts";
import type { PostType } from "@prisma/client";

export const TYPE_META: Record<
  PostType,
  { label: string; base: string; color: string; emoji: string }
> = {
  MEME: { label: "Meme", base: "/memes", color: "#8b5cf6", emoji: "😂" },
  CONFESSION: { label: "Confesión", base: "/confesionario", color: "#ec4899", emoji: "🤫" },
  NOTE: { label: "Nota curiosa", base: "/notas", color: "#0ea5e9", emoji: "💡" },
};

export function postPath(post: { type: PostType; slug: string }): string {
  return `${TYPE_META[post.type].base}/${post.slug}`;
}

export function PostCard({ post }: { post: PostListItem }) {
  const meta = TYPE_META[post.type];
  const href = postPath(post);
  const totalReactions = Object.values(post.reactionCounts).reduce((a, b) => a + b, 0);

  return (
    <article className="flex gap-3 rounded-xl border-2 border-neutral-900 bg-white p-3 shadow-[3px_3px_0_#0a0a0a] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0a0a0a]">
      <div className="flex-shrink-0">
        <VoteButtons
          id={post.id}
          initialScore={post.score}
          initialVote={post.myVote}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-white"
            style={{ backgroundColor: meta.color }}
          >
            <span aria-hidden>{meta.emoji}</span>
            {meta.label}
          </span>
          <span className="font-medium text-neutral-600">{post.authorName}</span>
          <span aria-hidden>·</span>
          <span>{formatRelativeDate(post.createdAt)}</span>
        </div>

        {post.title && (
          <Link href={href} className="group mt-1.5 block">
            <h3 className="text-base font-bold leading-snug text-neutral-900 group-hover:text-brand-600 md:text-lg">
              {post.title}
            </h3>
          </Link>
        )}

        {post.type === "MEME" && post.imageUrl && (
          <Link
            href={href}
            className="mt-2 block overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={post.imageUrl}
                alt={post.title || "Meme"}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover transition group-hover:scale-[1.02]"
              />
            </div>
          </Link>
        )}

        {post.type !== "MEME" && post.body && (
          <Link href={href} className="mt-1.5 block">
            <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {post.body}
            </p>
          </Link>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs font-medium text-neutral-500">
          <Link href={href} className="inline-flex items-center gap-1 hover:text-brand-600">
            💬 {post.commentCount} {post.commentCount === 1 ? "comentario" : "comentarios"}
          </Link>
          {totalReactions > 0 && (
            <span className="inline-flex items-center gap-1">
              {Object.entries(post.reactionCounts)
                .filter(([, n]) => n > 0)
                .slice(0, 3)
                .map(([e]) => (
                  <span key={e} aria-hidden>
                    {e}
                  </span>
                ))}
              {totalReactions}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
