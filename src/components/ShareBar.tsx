import { absoluteUrl } from "@/lib/site";

export function ShareBar({
  slug,
  title,
  path,
}: {
  slug: string;
  title: string;
  path?: string;
}) {
  const url = absoluteUrl(path ?? `/articulo/${slug}`);
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const buttons = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      bg: "bg-[#1877F2]",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${text}%20${encoded}`,
      bg: "bg-[#25D366]",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`,
      bg: "bg-black",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encoded}&text=${text}`,
      bg: "bg-[#0088cc]",
    },
  ];

  return (
    <div className="my-6 flex flex-wrap gap-2">
      <span className="self-center text-sm font-semibold text-neutral-700">Compartir:</span>
      {buttons.map((b) => (
        <a
          key={b.label}
          href={b.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${b.bg} hover:opacity-90`}
        >
          {b.label}
        </a>
      ))}
    </div>
  );
}
