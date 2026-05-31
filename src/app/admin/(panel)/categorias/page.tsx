import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { saveCategory } from "@/lib/admin-actions";
import { CategoryDeleteButton } from "@/components/admin/RowActions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ edit?: string }>;

const input =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-accent";

export default async function AdminCategorias({ searchParams }: { searchParams: SearchParams }) {
  const { edit } = await searchParams;

  const [categories, editing] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { articles: true, posts: true } } },
    }),
    edit ? prisma.category.findUnique({ where: { id: edit } }) : null,
  ]);

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900">Categorías</h1>
      <p className="mt-1 text-sm text-neutral-500">{categories.length} categoría(s)</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Form */}
        <form
          action={saveCategory}
          key={editing?.id ?? "new"}
          className="h-fit space-y-3 rounded-2xl border border-neutral-200 bg-white p-5"
        >
          <h2 className="font-extrabold text-neutral-900">
            {editing ? "Editar categoría" : "Nueva categoría"}
          </h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-600">Nombre</label>
            <input name="name" required defaultValue={editing?.name ?? ""} className={input} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-600">Descripción</label>
            <input name="description" defaultValue={editing?.description ?? ""} className={input} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold text-neutral-600">Color</label>
              <input type="color" name="color" defaultValue={editing?.color ?? "#ffd31a"} className="h-10 w-full rounded-lg border border-neutral-300" />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs font-bold text-neutral-600">Orden</label>
              <input type="number" name="order" defaultValue={editing?.order ?? 0} className={input} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800">
              {editing ? "Guardar cambios" : "Crear categoría"}
            </button>
            {editing && (
              <Link href="/admin/categorias" className="rounded-lg px-4 py-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900">
                Cancelar
              </Link>
            )}
          </div>
        </form>

        {/* Lista */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <ul className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="h-5 w-5 flex-shrink-0 rounded-full ring-1 ring-neutral-900/10" style={{ backgroundColor: c.color }} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-neutral-900">{c.name}</p>
                    <p className="text-xs text-neutral-500">
                      {c._count.articles} art. · {c._count.posts} posts · orden {c.order}
                    </p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/categorias?edit=${c.id}`}
                    className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-200"
                  >
                    ✎ Editar
                  </Link>
                  <CategoryDeleteButton id={c.id} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
