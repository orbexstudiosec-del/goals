"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/comunidad", label: "Comunidad", icon: "🛡️" },
  { href: "/admin/comentarios", label: "Comentarios", icon: "💬" },
  { href: "/admin/articulos", label: "Artículos", icon: "📰" },
  { href: "/admin/categorias", label: "Categorías", icon: "🏷️" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 overflow-x-auto md:block md:gap-0 md:space-y-1 md:overflow-visible">
      {ITEMS.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
              active
                ? "bg-accent text-neutral-900"
                : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <span aria-hidden>{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
