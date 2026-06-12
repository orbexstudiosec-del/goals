import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate } from "@/lib/site";
import { PostModButtons } from "@/components/admin/PostModButtons";
import { AdminMemeForm } from "@/components/admin/AdminMemeForm";
import type { ModStatus, PostType, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: { key: string; label: string }[] = [
  { key: "", label: "Todas" },
  { key: "PENDING", label: "Por revisar" },
  { key: "PUBLISHED", label: "Publicadas" },
  { key: "REMOVED", label: "Ocultas" },
];
const TYPES: { key: string; label: string }[] = [
  { key: "", label: "Todos" },
  { key: "MEME", label: "Memes" },
  { key: "CONFESSION", label: "Confesiones" },
];

const STATUS_BADGE: Record<ModStatus, string> = {
  PUBLISHED: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  REMOVED: "bg-red-100 text-red-700",
};

type SearchParams = Promise<{ status?: string; type?: string }>;

export default async function AdminComunidad({ searchParams }: { searchParams: SearchParams }) {
  const { status, type } = await searchParams;

  const where: Prisma.PostWhereInput = { type: { not: "NOTE" } };
  if (status && ["PENDING", "PUBLISHED", "REMOVED"].includes(status)) {
    where.status = status as ModStatus;
  }
  if (type && ["MEME", "CONFESSION"].includes(type)) {
    where.type = type as PostType;
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { category: { select: { name: true } } },
  });

  const qs = (next: Record<string, string>) => {
    const p = new URLSearchParams();
    if (next.status) p.set("status", next.status);
    if (next.type) p.set("type", next.type);
    const s = p.toString();
    return s ? `/admin/comunidad?${s}` : "/admin/comunidad";
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900">Moderar comunidad</h1>
      <p className="mt-1 text-sm text-neutral-500">{posts.length} publicación(es)</p>

      {/* Subir meme (solo admin) */}
      <details className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold text-neutral-800">
          😂 Subir un meme
        </summary>
        <div className="mt-3 max-w-md">
          <AdminMemeForm />
        </div>
      </details>

      {/* Filtros */}
      <div className="mt-4 flex flex-wrap gap-4">
        <FilterGroup label="Estado">
          {STATUSES.map((s) => (
            <FilterChip key={s.key} href={qs({ status: s.key, type: type ?? "" })} active={(status ?? "") === s.key}>
              {s.label}
            </FilterChip>
          ))}
        </FilterGroup>
        <FilterGroup label="Tipo">
          {TYPES.map((t) => (
            <FilterChip key={t.key} href={qs({ status: status ?? "", type: t.key })} active={(type ?? "") === t.key}>
              {t.label}
            </FilterChip>
          ))}
        </FilterGroup>
      </div>

      <div className="mt-5 space-y-3">
        {posts.length === 0 && (
          <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
            No hay publicaciones con esos filtros.
          </p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-bold uppercase">{p.type}</span>
              <span className={`rounded px-1.5 py-0.5 font-bold ${STATUS_BADGE[p.status]}`}>{p.status}</span>
              <span className="font-medium text-neutral-700">{p.authorName}</span>
              <span aria-hidden>·</span>
              <span>{formatRelativeDate(p.createdAt)}</span>
              <span aria-hidden>·</span>
              <span>▲ {p.score} · 💬 {p.commentCount}</span>
            </div>

            {p.title && <h3 className="mt-2 font-bold text-neutral-900">{p.title}</h3>}
            {p.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt="" className="mt-2 max-h-44 rounded-lg border border-neutral-100 object-contain" />
            )}
            {p.body && <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-neutral-600">{p.body}</p>}

            <div className="mt-3 flex items-center justify-between gap-2">
              <PostModButtons id={p.id} status={p.status} pinned={p.pinned} />
              <Link
                href={`/${p.type === "MEME" ? "memes" : "confesionario"}/${p.slug}`}
                target="_blank"
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
              >
                Ver ↗
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-bold uppercase text-neutral-400">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
        active ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-100"
      }`}
    >
      {children}
    </Link>
  );
}
