import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) return {};
  const title = `${cat.name} — ${siteConfig.name}`;
  const description = cat.description || `Las mejores notas de ${cat.name}.`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/categoria/${cat.slug}`) },
    openGraph: { title, description, type: "website" },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: { published: true, categoryId: category.id },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 24,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-3 text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">
          Inicio
        </Link>
        <span className="mx-1.5">›</span>
        <span>{category.name}</span>
      </nav>

      <div className="mb-6 border-l-4 pl-4" style={{ borderColor: category.color }}>
        <h1 className="text-3xl font-extrabold text-neutral-900">{category.name}</h1>
        {category.description && (
          <p className="mt-1 text-neutral-600">{category.description}</p>
        )}
      </div>

      <AdSlot slot="category-top" className="mb-6" />

      {articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Aún no hay artículos en esta categoría.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
