import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@prisma/client";

const SINGLETON_ID = "singleton";

const DEFAULTS: SiteSettings = {
  id: SINGLETON_ID,
  bannerEnabled: true,
  bannerText: "¡Síguenos en redes y no te pierdas nada de Goals Ec!",
  facebookUrl: "https://www.facebook.com/goalsec593",
  instagramUrl: "https://www.instagram.com/goalsec",
  tiktokUrl: "https://www.tiktok.com/@goalsec",
  youtubeUrl: null,
  xUrl: null,
  whatsappUrl: null,
  popupEnabled: false,
  popupTitle: null,
  popupBody: null,
  popupImage: null,
  popupCtaLabel: null,
  popupCtaUrl: null,
  seoTitle: null,
  seoDescription: null,
  ogImage: null,
  analyticsId: null,
  adsenseClient: null,
  secondBannerEnabled: false,
  secondBannerColor: "#1d4ed8",
  goalsUrl: null,
  tulcanenoUrl: null,
  stevenUrl: null,
  ecuatorianoUrl: null,
  updatedAt: new Date(0),
};

export type SocialLink = { key: string; label: string; url: string };

/** Devuelve la configuración del sitio (fila singleton) o los valores por defecto. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSettings
    .findUnique({ where: { id: SINGLETON_ID } })
    .catch(() => null);
  return row ?? DEFAULTS;
}

/** Lista de redes con URL configurada, en orden de aparición. */
export function socialLinks(s: SiteSettings): SocialLink[] {
  const all: SocialLink[] = [
    { key: "facebook", label: "Facebook", url: s.facebookUrl ?? "" },
    { key: "instagram", label: "Instagram", url: s.instagramUrl ?? "" },
    { key: "tiktok", label: "TikTok", url: s.tiktokUrl ?? "" },
    { key: "youtube", label: "YouTube", url: s.youtubeUrl ?? "" },
    { key: "x", label: "X", url: s.xUrl ?? "" },
    { key: "whatsapp", label: "WhatsApp", url: s.whatsappUrl ?? "" },
  ];
  return all.filter((l) => l.url.trim().length > 0);
}

/** Perfiles/marcas del segundo banner con URL configurada. */
export function brandLinks(s: SiteSettings): SocialLink[] {
  const all: SocialLink[] = [
    { key: "goals", label: "Goals", url: s.goalsUrl ?? "" },
    { key: "tulcaneno", label: "El Tulcañeño", url: s.tulcanenoUrl ?? "" },
    { key: "steven", label: "Steven", url: s.stevenUrl ?? "" },
    { key: "ecuatoriano", label: "El Ecuatoriano", url: s.ecuatorianoUrl ?? "" },
  ];
  return all.filter((l) => l.url.trim().length > 0);
}
