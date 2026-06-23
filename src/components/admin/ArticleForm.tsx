import Link from "next/link";
import { saveArticle } from "@/lib/admin-actions";
import { CoverImageField } from "@/components/admin/CoverImageField";
import { CopyLinkField } from "@/components/admin/CopyLinkField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageGalleryField } from "@/components/admin/ImageGalleryField";
import { siteConfig } from "@/lib/site";

type ArticleData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  categoryId: string;
  readingMinutes: number;
  metaTitle: string | null;
  metaDescription: string | null;
  published: boolean;
  featured: boolean;
  shortCode?: string | null;
};

const input =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-accent";
const label = "mb-1 block text-xs font-bold text-neutral-600";

export function ArticleForm({
  article,
  categories,
}: {
  article?: ArticleData;
  categories: { id: string; name: string }[];
}) {
  const articleUrl = article?.slug ? `${siteConfig.url}/articulo/${article.slug}` : null;

  return (
    <form action={saveArticle} className="max-w-3xl space-y-4">
      {article && <input type="hidden" name="id" value={article.id} />}

      {article?.shortCode && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <label className={label}>Link corto para compartir</label>
          <CopyLinkField url={`${siteConfig.url}/e/${article.shortCode}`} />
        </div>
      )}

      <div>
        <label className={label}>Título *</label>
        <input name="title" required defaultValue={article?.title ?? ""} className={input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Slug (opcional, se genera del título)</label>
          <input name="slug" defaultValue={article?.slug ?? ""} placeholder="auto" className={input} />
        </div>
        <div>
          <label className={label}>Categoría *</label>
          <select name="categoryId" required defaultValue={article?.categoryId ?? ""} className={input}>
            <option value="" disabled>
              Elige…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Extracto *</label>
        <textarea name="excerpt" required rows={2} defaultValue={article?.excerpt ?? ""} className={`${input} resize-y`} />
      </div>

      <div>
        <label className={label}>Contenido *</label>
        <RichTextEditor name="content" defaultValue={article?.content ?? ""} />
        <p className="mt-1 text-xs text-neutral-400">
          Usa la barra para dar formato. El botón <span className="font-mono">🖼</span> sube e inserta una imagen
          directamente en el contenido. El botón <span className="font-mono">{"</>"}</span> permite editar el HTML.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CoverImageField defaultValue={article?.coverImage} />
        <div>
          <label className={label}>Minutos de lectura</label>
          <input type="number" name="readingMinutes" defaultValue={article?.readingMinutes ?? 3} className={input} />
        </div>
      </div>

      <ImageGalleryField />

      <details className="rounded-lg border border-neutral-200 p-3">
        <summary className="cursor-pointer text-sm font-bold text-neutral-700">SEO (opcional)</summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className={label}>Meta título</label>
            <input name="metaTitle" defaultValue={article?.metaTitle ?? ""} className={input} />
          </div>
          <div>
            <label className={label}>Meta descripción</label>
            <input name="metaDescription" defaultValue={article?.metaDescription ?? ""} className={input} />
          </div>
        </div>
      </details>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <p className="mb-2 text-xs font-bold text-neutral-600">Estado de publicación</p>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <input type="checkbox" name="published" defaultChecked={article?.published ?? false} className="h-4 w-4" />
            Publicado
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <input type="checkbox" name="featured" defaultChecked={article?.featured ?? false} className="h-4 w-4" />
            Destacado
          </label>
        </div>
        {article?.published && articleUrl && (
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
          >
            Ver artículo publicado →
          </a>
        )}
        {article && !article.published && (
          <p className="mt-2 text-xs text-amber-600">Este artículo es un borrador y no es visible al público.</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800">
          {article ? "Guardar cambios" : "Crear artículo"}
        </button>
        <Link href="/admin/articulos" className="rounded-lg px-5 py-2.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
