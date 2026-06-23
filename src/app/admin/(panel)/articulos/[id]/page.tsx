import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ saved?: string }>;

export default async function EditarArticulo({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!article) notFound();

  const articleUrl = article.published
    ? `${siteConfig.url}/articulo/${article.slug}`
    : null;

  return (
    <div>
      {saved && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="text-sm font-semibold text-emerald-800">✓ Artículo guardado correctamente</span>
          {articleUrl && (
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-emerald-800"
            >
              Ver artículo →
            </a>
          )}
        </div>
      )}

      <h1 className="text-2xl font-black text-neutral-900">Editar artículo</h1>
      <p className="mt-1 mb-6 truncate text-sm text-neutral-500">{article.title}</p>
      <ArticleForm
        categories={categories}
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverImage: article.coverImage,
          categoryId: article.categoryId,
          readingMinutes: article.readingMinutes,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          published: article.published,
          featured: article.featured,
          shortCode: article.shortCode,
        }}
      />
    </div>
  );
}
