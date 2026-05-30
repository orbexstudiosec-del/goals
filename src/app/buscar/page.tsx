import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string }>;

export const metadata = {
  title: "Buscar",
  description: "Encuentra artículos por palabra clave.",
};

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const articles =
    query.length >= 2
      ? await prisma.article.findMany({
          where: {
            published: true,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { excerpt: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          },
          include: { category: true },
          orderBy: { publishedAt: "desc" },
          take: 30,
        })
      : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-3 text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">
          Inicio
        </Link>
      </nav>
      <h1 className="text-3xl font-extrabold text-neutral-900">Buscar</h1>

      <form action="/buscar" method="get" className="mt-4 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="¿Qué quieres encontrar?"
          className="w-full rounded-md border border-neutral-300 px-4 py-2.5 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          autoFocus
        />
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-5 py-2.5 font-semibold text-white hover:bg-brand-600"
        >
          Buscar
        </button>
      </form>

      <div className="mt-6">
        {query.length < 2 ? (
          <p className="text-neutral-500">Escribe al menos 2 letras para buscar.</p>
        ) : articles.length === 0 ? (
          <p className="text-neutral-500">
            No encontramos resultados para <strong>{query}</strong>.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-neutral-500">
              {articles.length} resultado{articles.length === 1 ? "" : "s"} para{" "}
              <strong>{query}</strong>
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
