import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/ArticleCard";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return {};
  const title = `#${tag.name} — ${siteConfig.name}`;
  return {
    title,
    description: `Artículos etiquetados como ${tag.name}.`,
    alternates: { canonical: absoluteUrl(`/tag/${tag.slug}`) },
  };
}

export default async function TagPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { article: { published: true } },
        include: { article: { include: { category: true } } },
        orderBy: { article: { publishedAt: "desc" } },
        take: 30,
      },
    },
  });
  if (!tag) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-3 text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">
          Inicio
        </Link>
      </nav>
      <h1 className="text-3xl font-extrabold text-neutral-900">#{tag.name}</h1>
      <p className="mt-1 text-neutral-600">
        {tag.articles.length} {tag.articles.length === 1 ? "artículo" : "artículos"}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tag.articles.map(({ article }) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
