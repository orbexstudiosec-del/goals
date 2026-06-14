import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdSlot } from "@/components/AdSlot";
import { ArticleCard } from "@/components/ArticleCard";
import { JsonLd } from "@/components/JsonLd";
import { ShareBar } from "@/components/ShareBar";
import { absoluteUrl, formatDate, siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/lib/settings";
import { withFlags, flagsToHtml } from "@/lib/flags";

export const revalidate = 600;

type Params = Promise<{ slug: string }>;

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug, published: true },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt;
  const url = absoluteUrl(`/articulo/${article.slug}`);

  const settings = await getSiteSettings();
  const ogImage = article.coverImage || settings.ogImage || "/og-default.png";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: [{ url: ogImage, alt: article.coverImageAlt || article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  prisma.article
    .update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => null);

  const related = await prisma.article
    .findMany({
      where: {
        published: true,
        categoryId: article.categoryId,
        NOT: { id: article.id },
      },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
    })
    .catch(() => []);

  const url = absoluteUrl(`/articulo/${article.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    articleSection: article.category.name,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <JsonLd data={jsonLd} />

      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">
          Inicio
        </Link>
        <span className="mx-1.5">›</span>
        <Link href={`/categoria/${article.category.slug}`} className="hover:text-neutral-900">
          {article.category.name}
        </Link>
      </nav>

      <span
        className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
        style={{ backgroundColor: article.category.color }}
      >
        {article.category.name}
      </span>

      <h1 className="mt-3 text-3xl font-extrabold leading-tight text-neutral-900 md:text-4xl">
        {withFlags(article.title)}
      </h1>

      <p className="mt-3 text-lg text-neutral-600">{withFlags(article.excerpt)}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
        {article.publishedAt && <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time>}
        <span aria-hidden>·</span>
        <span>{article.readingMinutes} min de lectura</span>
      </div>

      {article.coverImage && (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100">
          <Image
            src={article.coverImage}
            alt={article.coverImageAlt || article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <AdSlot slot="article-top" className="my-6" />

      <ShareBar slug={article.slug} title={article.title} />

      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: flagsToHtml(article.content) }}
      />

      <AdSlot slot="article-bottom" layout="in-article" format="fluid" className="my-8" />

      {article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <ShareBar slug={article.slug} title={article.title} />

      {related.length > 0 && (
        <section className="mt-12 border-t border-neutral-200 pt-8">
          <h2 className="mb-4 text-xl font-extrabold text-neutral-900">Sigue leyendo</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {related.map((r) => (
              <ArticleCard key={r.id} article={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
