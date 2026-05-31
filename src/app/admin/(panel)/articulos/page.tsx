import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate } from "@/lib/site";
import { ArticleRowActions } from "@/components/admin/RowActions";

export const dynamic = "force-dynamic";

export default async function AdminArticulos() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: { select: { name: true, color: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Artículos</h1>
          <p className="mt-1 text-sm text-neutral-500">{articles.length} artículo(s)</p>
        </div>
        <Link
          href="/admin/articulos/nuevo"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-neutral-900 ring-1 ring-neutral-900 transition hover:bg-accent-600"
        >
          + Nuevo artículo
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {articles.length === 0 ? (
          <p className="p-6 text-center text-sm text-neutral-500">Aún no hay artículos.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {articles.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white"
                      style={{ backgroundColor: a.category.color }}
                    >
                      {a.category.name}
                    </span>
                    {a.published ? (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-800">Publicado</span>
                    ) : (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">Borrador</span>
                    )}
                    {a.featured && <span className="text-xs">⭐</span>}
                  </div>
                  <Link href={`/admin/articulos/${a.id}`} className="mt-1 block truncate font-semibold text-neutral-900 hover:underline">
                    {a.title}
                  </Link>
                  <p className="text-xs text-neutral-400">Actualizado {formatRelativeDate(a.updatedAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/articulos/${a.id}`}
                    className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-200"
                  >
                    ✎ Editar
                  </Link>
                  <ArticleRowActions id={a.id} published={a.published} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
