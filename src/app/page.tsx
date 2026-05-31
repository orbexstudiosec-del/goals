import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/ArticleCard";
import { PostCard } from "@/components/PostCard";
import { MemeTile } from "@/components/MemeTile";
import { FeedTabs } from "@/components/FeedTabs";
import { HeroScene } from "@/components/HeroScene";
import { FlagEc } from "@/components/FlagEc";
import { ParticlesBg } from "@/components/ParticlesBg";
import { listPosts, parseOrden } from "@/lib/posts";
import type { PostType } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ZONES: {
  href: string;
  label: string;
  emoji: string;
  type: PostType;
  gradient: string;
}[] = [
  { href: "/memes", label: "Memes", emoji: "😂", type: "MEME", gradient: "from-violet-500 to-purple-700" },
  { href: "/confesionario", label: "Confesionario", emoji: "🤫", type: "CONFESSION", gradient: "from-pink-500 to-rose-700" },
  { href: "/notas", label: "Notas curiosas", emoji: "💡", type: "NOTE", gradient: "from-sky-500 to-cyan-700" },
];

const MINI = [
  { emoji: "😂", t: "Humor", s: "que nos define" },
  { emoji: "⛰️", t: "Lugares", s: "que enamoran" },
  { emoji: "🍜", t: "Comida", s: "que nos representa" },
  { emoji: "❤️", t: "Orgullo", s: "que nos une" },
];

const BAND = [
  { emoji: "⚡", t: "Contenido nuevo", s: "todos los días" },
  { emoji: "🔥", t: "Lo más viral", s: "de Ecuador" },
  { emoji: "📱", t: "Desde cualquier lugar", s: "del mundo" },
  { emoji: "❤️", t: "Hecho con amor", s: "por ecuatorianos" },
];

const AVATARS = [5, 12, 32, 45];

type SearchParams = Promise<{ orden?: string }>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { orden } = await searchParams;
  const ord = parseOrden(orden);

  const [feed, topMemes, countsRaw, hero, byCategory] = await Promise.all([
    listPosts({ orden: ord, take: 8 }),
    listPosts({ type: "MEME", orden: "top", take: 4 }),
    prisma.post
      .groupBy({ by: ["type"], where: { status: "PUBLISHED" }, _count: true })
      .catch(() => []),
    prisma.article
      .findMany({
        where: { published: true },
        include: { category: true },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: 1,
      })
      .catch(() => []),
    prisma.category
      .findMany({
        orderBy: { order: "asc" },
        include: {
          _count: { select: { articles: true } },
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

  const counts = countsRaw as { type: PostType; _count: number }[];
  const countByType = (t: PostType) => counts.find((c) => c.type === t)?._count ?? 0;
  const heroArticle = hero[0];

  return (
    <div>
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* fondo animado */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob-a absolute -left-24 -top-10 h-72 w-72 rounded-full bg-accent/40 blur-3xl md:h-96 md:w-96" />
          <div className="animate-blob-b absolute -right-16 top-8 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl md:h-[26rem] md:w-[26rem]" />
          <div className="animate-blob-c absolute -bottom-24 left-1/2 h-72 w-72 rounded-full bg-accent/25 blur-3xl md:h-96 md:w-96" />
          <ParticlesBg color="23,23,23" />
          <span className="animate-drift absolute left-[8%] top-[18%] text-2xl opacity-70">✦</span>
          <span className="animate-drift absolute right-[12%] bottom-[16%] text-xl opacity-60" style={{ animationDelay: "1.5s" }}>✦</span>
          <span className="animate-drift absolute left-[45%] top-[8%] text-lg opacity-50" style={{ animationDelay: "0.8s" }}>✦</span>
        </div>

        <div className="relative mx-auto flex max-w-6xl items-center px-4 pb-8 pt-6 md:pt-6 lg:min-h-[calc(100dvh-13.5rem)] lg:pb-6">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_1.3fr]">
            <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-neutral-900 shadow-sm">
              <FlagEc /> 100% Ecuador ❤️
            </span>

            <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-tight text-neutral-900 sm:text-5xl xl:text-6xl">
              Ecuador
              <br />
              como nunca
              <br />
              <span className="text-accent [paint-order:stroke] [-webkit-text-stroke:3px_#0a0a0a] sm:[-webkit-text-stroke:4px_#0a0a0a] xl:[-webkit-text-stroke:5px_#0a0a0a]">
                te lo contaron.
              </span>
            </h1>

            <p className="mt-4 max-w-md text-[15px] text-neutral-600 md:text-base">
              Memes, tradiciones, lugares increíbles, comida típica, historias y
              datos curiosos. Todo lo que nos hace únicos está aquí.{" "}
              <span className="font-bold text-neutral-900">¡Qué lindo es ser ecuatoriano!</span>{" "}
              <FlagEc />
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/memes"
                className="rounded-xl border-2 border-neutral-900 bg-accent px-6 py-3 text-sm font-bold text-neutral-900 shadow-[3px_3px_0_#0a0a0a] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0a0a0a]"
              >
                🚀 Explorar Ecuador
              </Link>
              <Link
                href="/publicar"
                className="rounded-xl border-2 border-neutral-900 bg-white px-6 py-3 text-sm font-bold text-neutral-900 shadow-[3px_3px_0_#0a0a0a] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0a0a0a]"
              >
                👥 Unirme a la comunidad
              </Link>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {AVATARS.map((n) => (
                  <Image
                    key={n}
                    src={`https://i.pravatar.cc/64?img=${n}`}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full border-2 border-[#fbf6f1]"
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-neutral-600">
                <span className="font-bold text-brand-600">+18K</span> ecuatorianos
                conectados
              </p>
            </div>

            {/* mini features */}
            <div className="mt-4 grid grid-cols-2 gap-y-2.5 rounded-2xl border border-neutral-200/80 bg-white px-4 py-2.5 shadow-sm sm:grid-cols-4 sm:divide-x sm:divide-neutral-100">
              {MINI.map((m) => (
                <div key={m.t} className="flex items-center gap-2 sm:px-3">
                  <span className="text-xl">{m.emoji}</span>
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-neutral-900">{m.t}</p>
                    <p className="text-[11px] text-neutral-500">{m.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* escena */}
          <div
            className="animate-fade-up order-first lg:order-last"
            style={{ animationDelay: "0.15s" }}
          >
            <HeroScene />
          </div>
          </div>
        </div>
      </section>

      {/* ── BARRA DE VALOR (degradado) ─────────────────────── */}
      <section className="bg-accent text-neutral-900">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-5 md:grid-cols-4">
          {BAND.map((b) => (
            <div key={b.t} className="flex items-center gap-3">
              <span className="text-2xl">{b.emoji}</span>
              <div className="leading-tight">
                <p className="text-sm font-bold">{b.t}</p>
                <p className="text-xs text-neutral-700">{b.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ZONAS / COMUNIDADES ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-neutral-900 md:text-2xl">
            Zonas que te pueden interesar
          </h2>
          <Link
            href="/publicar"
            className="text-sm font-bold text-neutral-900 underline decoration-accent decoration-2 underline-offset-4 hover:decoration-neutral-900"
          >
            Publicar →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ZONES.map((z) => (
            <ExploreCard
              key={z.href}
              href={z.href}
              emoji={z.emoji}
              gradient={z.gradient}
              name={z.label}
              count={`${countByType(z.type)} posts`}
              action="Entrar"
            />
          ))}
          {byCategory.slice(0, 2).map((cat) => (
            <ExploreCard
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              letter={cat.name.charAt(0)}
              color={cat.color}
              name={cat.name}
              count={`${cat._count.articles} notas`}
              action="Ver"
            />
          ))}
        </div>
      </section>

      {/* ── TENDENCIA + FEED ───────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        {topMemes.length > 0 && (
          <>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black tracking-tight text-neutral-900 md:text-2xl">
              🔥 Memes en tendencia
            </h2>
            <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {topMemes.map((post, i) => (
                <MemeTile key={post.id} post={post} priority={i < 2} />
              ))}
            </div>
          </>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-neutral-900 md:text-2xl">
            ⚡ En la comunidad
          </h2>
          <FeedTabs basePath="/" orden={ord} />
        </div>

        {feed.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {feed.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl border-2 border-neutral-900 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black px-6 py-12 text-white shadow-[6px_6px_0_#171717] md:px-14 md:py-16">
          {/* fondo animado: partículas amarillas */}
          <ParticlesBg color="255,211,26" />
          <Sparkles />
          {/* glows amarillos animados */}
          <div className="animate-blob-a pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="animate-blob-b pointer-events-none absolute -bottom-12 left-1/4 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-6 bottom-2 hidden text-[8rem] leading-none opacity-90 md:block">
            <span className="drop-shadow-lg">😂🤫💡</span>
          </div>
          <div className="relative max-w-xl">
            <h2 className="text-2xl font-black leading-tight md:text-4xl">
              ¡Qué lindo es ser <span className="text-accent">ecuatoriano!</span> <FlagEc />
            </h2>
            <p className="mt-3 text-sm text-white/80 md:text-base">
              Un espacio hecho por ecuatorianos, para ecuatorianos y para todos los
              que aman Ecuador. Súmate gratis y comparte lo nuestro.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/publicar"
                className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-600"
              >
                Publicar gratis
              </Link>
              <Link
                href="/memes"
                className="rounded-xl border-2 border-white/50 px-6 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
              >
                Más información
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        {heroArticle && (
          <div className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black tracking-tight text-neutral-900 md:text-2xl">
              📰 Destacado de la redacción
            </h2>
            <ArticleCard article={heroArticle} variant="hero" />
          </div>
        )}

        {byCategory
          .filter((c) => c.articles.length > 0)
          .map((cat) => (
            <div key={cat.id} className="mb-12">
              <div
                className="mb-4 flex items-baseline justify-between border-l-4 pl-3"
                style={{ borderColor: cat.color }}
              >
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
            </div>
          ))}
      </section>
    </div>
  );
}

function ExploreCard({
  href,
  emoji,
  letter,
  color,
  gradient,
  name,
  count,
  action,
}: {
  href: string;
  emoji?: string;
  letter?: string;
  color?: string;
  gradient?: string;
  name: string;
  count: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center rounded-2xl border-2 border-neutral-900 bg-white p-5 text-center shadow-[3px_3px_0_#0a0a0a] transition hover:-translate-y-1 hover:shadow-[5px_5px_0_#0a0a0a]"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl font-black text-white ring-2 ring-neutral-900 ${
          gradient ? `bg-gradient-to-br ${gradient}` : ""
        }`}
        style={!gradient ? { backgroundColor: color } : undefined}
      >
        {emoji ?? letter}
      </div>
      <h3 className="mt-3 text-sm font-extrabold text-neutral-900">{name}</h3>
      <p className="text-xs font-medium text-neutral-500">{count}</p>
      <span className="mt-3 w-full rounded-lg border-2 border-neutral-900 py-1.5 text-xs font-bold text-neutral-900 transition group-hover:bg-accent">
        {action}
      </span>
    </Link>
  );
}

function Sparkles() {
  return (
    <>
      <span className="pointer-events-none absolute right-1/3 top-6 text-2xl text-accent opacity-90">✦</span>
      <span className="pointer-events-none absolute right-10 top-10 text-lg text-accent opacity-70">✦</span>
      <span className="pointer-events-none absolute bottom-8 right-1/2 text-xl text-accent opacity-60">✦</span>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-14 text-center">
      <p className="text-neutral-600">Aún no hay publicaciones de la comunidad.</p>
      <Link
        href="/publicar"
        className="mt-3 inline-block rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700"
      >
        Publica la primera
      </Link>
    </div>
  );
}
