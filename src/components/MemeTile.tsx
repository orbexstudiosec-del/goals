import Image from "next/image";
import Link from "next/link";
import type { PostListItem } from "@/lib/posts";

/** Miniatura visual de meme, image-forward, con score y caption en overlay. */
export function MemeTile({ post, priority = false }: { post: PostListItem; priority?: boolean }) {
  if (!post.imageUrl) return null;

  return (
    <Link
      href={`/memes/${post.slug}`}
      className="group relative block overflow-hidden rounded-2xl border-2 border-neutral-900 bg-neutral-900 shadow-[3px_3px_0_#0a0a0a] transition hover:-translate-y-1 hover:shadow-[5px_5px_0_#0a0a0a]"
    >
      <div className="relative aspect-square w-full">
        <Image
          src={post.imageUrl}
          alt={post.title || "Meme"}
          fill
          priority={priority}
          sizes="(max-width: 768px) 50vw, 300px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* Badge de score */}
      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-extrabold text-neutral-900 ring-1 ring-neutral-900">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M12 4l8 10h-5v6H9v-6H4z" />
        </svg>
        {post.score}
      </div>

      {/* Overlay con caption */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3">
        {post.title && (
          <p className="line-clamp-2 text-sm font-semibold text-white">{post.title}</p>
        )}
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/80">
          <span>{post.authorName}</span>
          <span aria-hidden>·</span>
          <span>💬 {post.commentCount}</span>
        </div>
      </div>
    </Link>
  );
}
