import type { SiteSettings } from "@prisma/client";
import { brandLinks } from "@/lib/settings";

/** Determina si usar texto claro u oscuro según el color de fondo. */
function readableText(hex: string): string {
  const m = hex.replace("#", "");
  if (m.length !== 6) return "#ffffff";
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0a0a0a" : "#ffffff";
}

export function SecondBanner({ settings }: { settings: SiteSettings }) {
  if (!settings.secondBannerEnabled) return null;
  const links = brandLinks(settings);
  if (links.length === 0) return null;

  const bg = settings.secondBannerColor || "#1d4ed8";
  const fg = readableText(bg);

  return (
    <div style={{ backgroundColor: bg, color: fg }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2 text-center text-sm font-bold">
        <span className="opacity-80">Síguenos también en:</span>
        {links.map((l) => (
          <a
            key={l.key}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 transition hover:underline hover:opacity-80"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
