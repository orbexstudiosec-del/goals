import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";
import Link from "next/link";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, latest, byCategory] = await Promise.all([
    prisma.article
      .findMany({
        where: { published: true, featured: true },
        include: { category: true },
        orderBy: { publishedAt: "desc" },
        take: 1,
      })
      .catch(() => []),
    prisma.article
      .findMany({
        where: { published: true },
        include: { category: true },
        orderBy: { publishedAt: "desc" },
        take: 12,
      })
      .catch(() => []),
    prisma.category
      .findMany({
        orderBy: { order: "asc" },
        include: {
          articles: {
            where: { published: true },
            include: { category: true },
            orderBy: { publishedAt: "desc" },
            take: 4,
          },
        },
      })
      .catch(() => []),
  ]);

  const hero = featured[0] ?? latest[0];
  const rest = latest.filter((a) => a.id !== hero?.id).slice(0, 8);

  if (!hero) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold text-neutral-900">
          ¡Bienvenido!
        </h1>
        <p className="mt-4 text-neutral-600">
          Aún no hay artículos publicados. Ejecuta{" "}
          <code className="rounded bg-neutral-100 px-2 py-0.5 text-sm">npm run db:seed</code>{" "}
          para cargar contenido de muestra.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <section>
        <ArticleCard article={hero} variant="hero" />
      </section>

      <AdSlot slot="home-top" className="my-8" />

      <section className="mt-2">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold text-neutral-900">Lo más reciente</h2>
          <Link href="/buscar" className="text-sm font-semibold text-brand-600 hover:underline">
            Ver todo →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {byCategory
        .filter((c) => c.articles.length > 0)
        .map((cat, idx) => (
          <section key={cat.id} className="mt-12">
            {idx === 1 && <AdSlot slot="home-mid" className="mb-8" />}
            <div className="mb-4 flex items-baseline justify-between border-l-4 pl-3" style={{ borderColor: cat.color }}>
              <h2 className="text-xl font-extrabold text-neutral-900">{cat.name}</h2>
              <Link
                href={`/categoria/${cat.slug}`}
                className="text-sm font-semibold hover:underline"
                style={{ color: cat.color }}
              >
                Ver más →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cat.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
