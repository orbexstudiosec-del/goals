import Image from "next/image";
import { ReactionBar } from "@/components/ReactionBar";
import { ShareButton } from "@/components/ShareButton";
import { absoluteUrl } from "@/lib/site";
import type { PostListItem } from "@/lib/posts";

/** Feed de memes estilo Instagram: imagen grande directo en la página, con descargar + compartir siempre visibles debajo. */
export function MemeFeed({ posts }: { posts: PostListItem[] }) {
  return (
    <div className="space-y-6">
      {posts.map((post, i) => {
        if (!post.imageUrl) return null;
        const title = post.title || "Meme";
        const filename = post.imageUrl.split("/").pop() || "meme.jpg";

        return (
          <article
            key={post.id}
            className="overflow-hidden rounded-2xl border-2 border-neutral-900 bg-neutral-900 shadow-[3px_3px_0_#0a0a0a]"
          >
            {post.imageWidth && post.imageHeight ? (
              <Image
                src={post.imageUrl}
                alt={post.title || "Meme"}
                width={post.imageWidth}
                height={post.imageHeight}
                className="mx-auto h-auto max-h-[85vh] w-full object-contain"
                priority={i === 0}
              />
            ) : (
              <div className="relative aspect-square w-full">
                <Image
                  src={post.imageUrl}
                  alt={post.title || "Meme"}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 px-3 py-3">
              <a
                href={post.imageUrl}
                download={filename}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-neutral-900 hover:bg-neutral-200"
              >
                ⬇ Descargar
              </a>
              <ShareButton url={absoluteUrl(`/memes/${post.slug}`)} title={title} />
            </div>

            <div className="px-3 pb-3">
              {post.title && (
                <p className="truncate text-sm font-semibold text-white">{post.title}</p>
              )}
              <p className="text-xs text-white/50">{post.authorName}</p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <ReactionBar
                  postId={post.id}
                  initialCounts={post.reactionCounts}
                  initialMine={post.myReactions}
                />
                <span className="text-xs font-bold text-white/70">💬 {post.commentCount}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
