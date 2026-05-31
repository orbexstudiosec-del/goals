import Link from "next/link";
import type { Orden } from "@/lib/posts";

const TABS: { key: Orden; label: string; icon: string }[] = [
  { key: "nuevo", label: "Recientes", icon: "🆕" },
  { key: "top", label: "Top", icon: "🔥" },
];

export function FeedTabs({ basePath, orden }: { basePath: string; orden: Orden }) {
  return (
    <div className="inline-flex rounded-full border-2 border-neutral-900 bg-white p-1 shadow-[2px_2px_0_#0a0a0a]">
      {TABS.map((tab) => {
        const active = tab.key === orden;
        const href = tab.key === "nuevo" ? basePath : `${basePath}?orden=${tab.key}`;
        return (
          <Link
            key={tab.key}
            href={href}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              active
                ? "bg-accent text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span aria-hidden className="mr-1">
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
