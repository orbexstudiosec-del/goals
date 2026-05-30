export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Goals Ec",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description:
    "Listas, curiosidades y noticias virales de Ecuador y el mundo. Lo que tienes que saber, contado rápido.",
  locale: "es_EC",
  twitter: "@goalsec",
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
} as const;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 60) return "hace unos segundos";
  if (min < 60) return `hace ${min} min`;
  if (hr < 24) return `hace ${hr} h`;
  if (day < 7) return `hace ${day} d`;
  return formatDate(d);
}
