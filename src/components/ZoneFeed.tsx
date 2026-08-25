import Link from "next/link";
import { FeedTabs } from "@/components/FeedTabs";
import { PostCard } from "@/components/PostCard";
import { AdSlot } from "@/components/AdSlot";
import { listPosts, parseOrden } from "@/lib/posts";
import type { PostType } from "@prisma/client";

type Props = {
  type: PostType;
  title: string;
  description: string;
  basePath: string;
  orden?: string;
  columns?: 1 | 2;
};

export async function ZoneFeed({
  type,
  title,
  description,
  basePath,
  orden,
  columns = 1,
}: Props) {
  const ord = parseOrden(orden);
  const posts = await listPosts({ type, orden: ord, take: 40 });
  const canPublish = type !== "MEME";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
        {canPublish && (
          <Link
            href="/publicar"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
          >
            + Publicar
          </Link>
        )}
      </div>

      <FeedTabs basePath={basePath} orden={ord} />

      <AdSlot slot="zone-top" className="my-6" />

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
          <p className="text-neutral-600">Todavía no hay nada por aquí.</p>
          {canPublish && (
            <Link
              href="/publicar"
              className="mt-3 inline-block rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700"
            >
              Sé el primero en publicar
            </Link>
          )}
        </div>
      ) : (
        <div
          className={
            columns === 2
              ? "mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
              : "mt-5 space-y-4"
          }
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
