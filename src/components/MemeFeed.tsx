import Image from "next/image";
import { absoluteUrl } from "@/lib/site";
import type { PostListItem } from "@/lib/posts";

const SHARE_BUTTONS = (url: string, text: string) => [
  { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${url}`, bg: "bg-[#1877F2]" },
  { label: "WhatsApp", href: `https://wa.me/?text=${text}%20${url}`, bg: "bg-[#25D366]" },
  { label: "X", href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`, bg: "bg-black" },
  { label: "Telegram", href: `https://t.me/share/url?url=${url}&text=${text}`, bg: "bg-[#0088cc]" },
];

/** Feed de memes estilo Instagram: imagen grande directo en la página, con descargar + compartir siempre visibles debajo. */
export function MemeFeed({ posts }: { posts: PostListItem[] }) {
  return (
    <div className="space-y-6">
      {posts.map((post, i) => {
        if (!post.imageUrl) return null;
        const url = encodeURIComponent(absoluteUrl(`/memes/${post.slug}`));
        const text = encodeURIComponent(post.title || "Meme");
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
              {SHARE_BUTTONS(url, text).map((b) => (
                <a
                  key={b.label}
                  href={b.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-full px-3 py-1.5 text-sm font-bold text-white hover:opacity-90 ${b.bg}`}
                >
                  {b.label}
                </a>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 px-3 pb-3 text-xs text-white/70">
              <div className="min-w-0">
                {post.title && <p className="truncate font-semibold text-white">{post.title}</p>}
                <p className="text-white/50">{post.authorName}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2 font-bold">
                <span>▲ {post.score}</span>
                <span>💬 {post.commentCount}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
