import { teamCode } from "@/lib/teams";

/**
 * Bandera de una selección como imagen (flagcdn.com).
 * Los emojis de bandera no renderizan en Windows/Chrome, por eso usamos imágenes.
 */
export function Flag({ name, className = "h-7 w-10" }: { name: string; className?: string }) {
  const code = teamCode(name);

  if (!code) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-[3px] bg-neutral-100 text-base ring-1 ring-black/10 ${className}`}
        aria-label={name}
        role="img"
      >
        ⚽
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
      alt={name}
      loading="lazy"
      className={`inline-block rounded-[3px] object-cover shadow-sm ring-1 ring-black/10 ${className}`}
    />
  );
}
