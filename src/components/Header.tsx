import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export async function Header() {
  const categories = await prisma.category
    .findMany({ orderBy: { order: "asc" }, take: 8 })
    .catch(() => []);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
        <Link href="/" className="flex items-center" aria-label={siteConfig.name}>
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={400}
            height={336}
            priority
            className="h-11 w-auto md:h-14"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categoria/${c.slug}`}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/buscar"
            className="ml-2 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Buscar
          </Link>
        </nav>

        <Link
          href="/buscar"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white md:hidden"
        >
          Buscar
        </Link>
      </div>

      <div className="border-t border-neutral-200 md:hidden">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categoria/${c.slug}`}
              className="whitespace-nowrap rounded-md px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
