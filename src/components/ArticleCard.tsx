import Image from "next/image";
import Link from "next/link";
import { formatRelativeDate } from "@/lib/site";
import { withFlags } from "@/lib/flags";

type ArticleCardArticle = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  publishedAt: Date | null;
  readingMinutes: number;
  category: { name: string; slug: string; color: string };
};

export function ArticleCard({
  article,
  variant = "default",
}: {
  article: ArticleCardArticle;
  variant?: "default" | "compact" | "hero";
}) {
  const href = `/articulo/${article.slug}`;

  if (variant === "hero") {
    return (
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-2xl bg-neutral-900 shadow-md"
      >
        {article.coverImage && (
          <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
            <Image
              src={article.coverImage}
              alt={article.coverImageAlt || article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover opacity-75 transition group-hover:scale-105 group-hover:opacity-90"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
            style={{ backgroundColor: article.category.color }}
          >
            {article.category.name}
          </span>
          <h2 className="mt-3 max-w-3xl text-2xl font-extrabold leading-tight text-white md:text-4xl">
            {withFlags(article.title)}
          </h2>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-neutral-200 md:text-base">
            {withFlags(article.excerpt)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group flex gap-3">
        {article.coverImage && (
          <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100">
            <Image
              src={article.coverImage}
              alt={article.coverImageAlt || article.title}
              fill
              sizes="120px"
              className="object-cover transition group-hover:scale-105"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: article.category.color }}>
            {article.category.name}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 group-hover:text-brand-600">
            {withFlags(article.title)}
          </h3>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {article.coverImage && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
          <Image
            src={article.coverImage}
            alt={article.coverImageAlt || article.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <span
          className="inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
          style={{ backgroundColor: article.category.color }}
        >
          {article.category.name}
        </span>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-neutral-900 group-hover:text-brand-600">
          {withFlags(article.title)}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-neutral-600">{withFlags(article.excerpt)}</p>
        <div className="mt-auto flex items-center gap-2 pt-3 text-xs text-neutral-500">
          {article.publishedAt && <span>{formatRelativeDate(article.publishedAt)}</span>}
          <span aria-hidden>·</span>
          <span>{article.readingMinutes} min de lectura</span>
        </div>
      </div>
    </Link>
  );
}
