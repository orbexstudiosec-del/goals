import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function NuevoArticulo() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900">Nuevo artículo</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">Crea contenido editorial para Goals Ec.</p>
      <ArticleForm categories={categories} />
    </div>
  );
}
