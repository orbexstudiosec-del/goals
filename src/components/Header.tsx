import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { FlagEc } from "@/components/FlagEc";

const COMMUNITY = [
  { href: "/memes", label: "Memes" },
  { href: "/confesionario", label: "Confesionario" },
  { href: "/notas", label: "Notas" },
];

const CAT_EMOJI: Record<string, string> = {
  Curiosidades: "💡",
  Tecnología: "📱",
  Entretenimiento: "😂",
  Mundo: "🌍",
  Deportes: "⚽",
};

export async function Header() {
  const categories = await prisma.category
    .findMany({ orderBy: { order: "asc" }, take: 6 })
    .catch(() => []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 shadow-sm backdrop-blur">
      {/* ── Barra superior ── */}
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2">
        <Link href="/" aria-label="Goals Ec" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Goals Ec"
            width={400}
            height={336}
            priority
            className="h-14 w-auto md:h-[5.5rem]"
          />
        </Link>

        <nav className="hidden items-center justify-center gap-8 md:flex">
          {COMMUNITY.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="text-[15px] font-bold text-neutral-800 transition hover:text-brand-600"
            >
              {c.label}
            </Link>
          ))}
          <Link
            href="/buscar"
            className="flex items-center gap-1.5 text-[15px] font-bold text-neutral-800 transition hover:text-brand-600"
          >
            Buscar
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
          </Link>
        </nav>

        <Link
          href="/publicar"
          className="flex items-center gap-1 justify-self-end rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-neutral-900 shadow-sm transition hover:bg-accent-600"
        >
          <span className="text-base leading-none">+</span> Publicar
        </Link>
      </div>

      {/* ── Barra de categorías ── */}
      <div className="border-t border-neutral-100">
        <div className="mx-auto flex max-w-6xl items-center gap-1.5 overflow-x-auto px-4 py-1.5 md:justify-center">
          {/* enlaces de comunidad + buscar en móvil */}
          {COMMUNITY.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold text-neutral-800 hover:bg-neutral-100 md:hidden"
            >
              {c.label}
            </Link>
          ))}
          <Link
            href="/buscar"
            className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold text-neutral-800 hover:bg-neutral-100 md:hidden"
          >
            Buscar
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
          </Link>
          {categories.map((c, i) => {
            const active = i === 0;
            return (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-accent text-neutral-900 ring-1 ring-accent-600"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {c.name === "Ecuador" ? (
                  <FlagEc />
                ) : (
                  <span aria-hidden>{CAT_EMOJI[c.name] ?? "📌"}</span>
                )}
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
