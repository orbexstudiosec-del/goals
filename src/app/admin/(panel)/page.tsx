import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getViewsSummary,
  getViewsPerDay,
  getTopPages,
} from "@/lib/analytics";
import { ViewsChart } from "@/components/admin/ViewsChart";
import { RealtimePanel } from "@/components/admin/RealtimePanel";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [posts, pending, comments, articlesTotal, articlesPub, categories, top, views, perDay, topPages] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "PENDING" } }),
      prisma.comment.count(),
      prisma.article.count(),
      prisma.article.count({ where: { published: true } }),
      prisma.category.count(),
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { score: "desc" },
        take: 5,
        select: { id: true, title: true, type: true, score: true, slug: true },
      }),
      getViewsSummary(),
      getViewsPerDay(14),
      getTopPages(30, 8),
    ]);

  const stats = [
    { label: "Publicaciones", value: posts, href: "/admin/comunidad" },
    { label: "Por revisar", value: pending, href: "/admin/comunidad?status=PENDING", alert: pending > 0 },
    { label: "Comentarios", value: comments, href: "/admin/comentarios" },
    { label: "Artículos", value: `${articlesPub}/${articlesTotal}`, href: "/admin/articulos" },
    { label: "Categorías", value: categories, href: "/admin/categorias" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Resumen de la comunidad Goals Ec.</p>

      {/* ── En vivo (tiempo real) ── */}
      <div className="mt-5">
        <RealtimePanel />
      </div>

      {/* ── Analíticas de visitas ── */}
      <h2 className="mt-6 flex items-center gap-2 text-lg font-extrabold text-neutral-900">
        📈 Visitas
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Hoy", value: views.today },
          { label: "Últimos 7 días", value: views.d7 },
          { label: "Últimos 30 días", value: views.d30 },
          { label: "Únicos (7 días)", value: views.uniq7 },
          { label: "Total histórico", value: views.total },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="text-3xl font-black text-neutral-900">{s.value.toLocaleString("es-EC")}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <ViewsChart data={perDay} />
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">
            Páginas más vistas (30 días)
          </h3>
          {topPages.length === 0 ? (
            <p className="text-sm text-neutral-400">Aún no hay visitas registradas.</p>
          ) : (
            <ul className="space-y-2">
              {topPages.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-neutral-700">{p.path}</span>
                  <span className="flex-shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-700">
                    {p.views.toLocaleString("es-EC")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Comunidad ── */}
      <h2 className="mt-8 text-lg font-extrabold text-neutral-900">🧩 Comunidad y contenido</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
              s.alert ? "border-accent ring-2 ring-accent" : "border-neutral-200"
            }`}
          >
            <div className="text-3xl font-black text-neutral-900">{s.value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      {pending > 0 && (
        <div className="mt-6 rounded-2xl border border-accent bg-accent/10 p-4">
          <p className="text-sm font-semibold text-neutral-900">
            ⚠️ Tienes <strong>{pending}</strong> publicación(es) reportada(s) por revisar.
          </p>
          <Link
            href="/admin/comunidad?status=PENDING"
            className="mt-2 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800"
          >
            Revisar ahora →
          </Link>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-extrabold text-neutral-900">🔥 Top publicaciones</h2>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {top.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">Aún no hay publicaciones.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {top.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="truncate text-sm font-medium text-neutral-800">
                    <span className="mr-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-neutral-500">
                      {p.type}
                    </span>
                    {p.title || "(sin título)"}
                  </span>
                  <span className="flex-shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-neutral-900">
                    ▲ {p.score}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-8 text-xs text-neutral-400">
        Recuerda actualizar la contraseña por defecto: <code>npm run admin:create -- tu@email.com TuClave &quot;Tu Nombre&quot;</code>
      </p>
    </div>
  );
}
