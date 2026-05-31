import Image from "next/image";
import Link from "next/link";
import { VoteButtons } from "@/components/VoteButtons";
import { ReactionBar } from "@/components/ReactionBar";
import { CommentThread } from "@/components/CommentThread";
import { ShareBar } from "@/components/ShareBar";
import { TYPE_META, postPath } from "@/components/PostCard";
import { getNickname } from "@/lib/identity";
import { formatRelativeDate } from "@/lib/site";
import type { PostDetail } from "@/lib/posts";

export async function PostDetailView({ post }: { post: PostDetail }) {
  const meta = TYPE_META[post.type];
  const nickname = await getNickname();
  const path = postPath(post);

  return (
    <article className="mx-auto max-w-2xl px-4 py-6">
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">
          Inicio
        </Link>
        <span className="mx-1.5">›</span>
        <Link href={meta.base} className="hover:text-neutral-900">
          {meta.label}
        </Link>
      </nav>

      <div className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex-shrink-0">
          <VoteButtons id={post.id} initialScore={post.score} initialVote={post.myVote} />
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
            <h1 className="mt-2 text-2xl font-extrabold leading-tight text-neutral-900">
              {post.title}
            </h1>
          )}

          {post.type === "MEME" && post.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
              {post.imageWidth && post.imageHeight ? (
                <Image
                  src={post.imageUrl}
                  alt={post.title || "Meme"}
                  width={post.imageWidth}
                  height={post.imageHeight}
                  className="mx-auto h-auto w-full"
                  priority
                />
              ) : (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={post.imageUrl}
                    alt={post.title || "Meme"}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              )}
            </div>
          )}

          {post.type !== "MEME" && post.body && (
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-800">
              {post.body}
            </p>
          )}

          <div className="mt-4">
            <ReactionBar
              postId={post.id}
              initialCounts={post.reactionCounts}
              initialMine={post.myReactions}
            />
          </div>
        </div>
      </div>

      <ShareBar slug={post.slug} title={post.title || meta.label} path={path} />

      <CommentThread
        postId={post.id}
        path={path}
        nickname={nickname}
        comments={post.comments}
      />
    </article>
  );
}
