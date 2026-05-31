import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditarArticulo({ params }: { params: Params }) {
  const { id } = await params;
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!article) notFound();

  return (
    <div>
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
        }}
      />
    </div>
  );
}
