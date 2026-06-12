import { saveSiteSettings } from "@/lib/admin-actions";
import { getSiteSettings } from "@/lib/settings";
import { CoverImageField } from "@/components/admin/CoverImageField";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ ok?: string }>;

const input =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-accent";
const label = "mb-1 block text-xs font-bold text-neutral-600";

const SOCIALS: { name: string; label: string; placeholder: string; key: keyof Awaited<ReturnType<typeof getSiteSettings>> }[] = [
  { name: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/tu-pagina", key: "facebookUrl" },
  { name: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/tu-usuario", key: "instagramUrl" },
  { name: "tiktokUrl", label: "TikTok", placeholder: "https://tiktok.com/@tu-usuario", key: "tiktokUrl" },
  { name: "youtubeUrl", label: "YouTube", placeholder: "https://youtube.com/@tu-canal", key: "youtubeUrl" },
  { name: "xUrl", label: "X (Twitter)", placeholder: "https://x.com/tu-usuario", key: "xUrl" },
  { name: "whatsappUrl", label: "WhatsApp / Canal", placeholder: "https://wa.me/593...", key: "whatsappUrl" },
];

export default async function AdminAjustes({ searchParams }: { searchParams: SearchParams }) {
  const { ok } = await searchParams;
  const s = await getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900">Ajustes</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Banner de redes sociales que aparece en todas las páginas del sitio.
      </p>

      {ok && (
        <div className="mt-4 rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
          ✓ Cambios guardados.
        </div>
      )}

      <form action={saveSiteSettings} className="mt-5 max-w-2xl space-y-5 rounded-2xl border border-neutral-200 bg-white p-6">
        <section className="space-y-3">
          <h2 className="font-extrabold text-neutral-900">Banner</h2>
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <input type="checkbox" name="bannerEnabled" defaultChecked={s.bannerEnabled} className="h-4 w-4" />
            Mostrar el banner en el sitio
          </label>
          <div>
            <label className={label}>Texto del banner</label>
            <input name="bannerText" defaultValue={s.bannerText} className={input} />
          </div>
        </section>

        <section className="space-y-3 border-t border-neutral-100 pt-5">
          <h2 className="font-extrabold text-neutral-900">Redes sociales</h2>
          <p className="text-xs text-neutral-500">
            Deja un campo vacío para ocultar esa red en el banner.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SOCIALS.map((soc) => (
              <div key={soc.name}>
                <label className={label}>{soc.label}</label>
                <input
                  name={soc.name}
                  type="url"
                  defaultValue={(s[soc.key] as string | null) ?? ""}
                  placeholder={soc.placeholder}
                  className={input}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3 border-t border-neutral-100 pt-5">
          <h2 className="font-extrabold text-neutral-900">Segundo banner (perfiles)</h2>
          <p className="text-xs text-neutral-500">
            Banner adicional de otro color con tus otros perfiles. Deja vacío para ocultar uno.
          </p>
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <input type="checkbox" name="secondBannerEnabled" defaultChecked={s.secondBannerEnabled} className="h-4 w-4" />
            Mostrar el segundo banner
          </label>
          <div className="flex items-center gap-3">
            <label className={label}>Color</label>
            <input type="color" name="secondBannerColor" defaultValue={s.secondBannerColor} className="h-9 w-16 rounded border border-neutral-300" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Goals</label>
              <input name="goalsUrl" type="url" defaultValue={s.goalsUrl ?? ""} placeholder="https://…" className={input} />
            </div>
            <div>
              <label className={label}>El Tulcañeño</label>
              <input name="tulcanenoUrl" type="url" defaultValue={s.tulcanenoUrl ?? ""} placeholder="https://…" className={input} />
            </div>
            <div>
              <label className={label}>Steven</label>
              <input name="stevenUrl" type="url" defaultValue={s.stevenUrl ?? ""} placeholder="https://…" className={input} />
            </div>
            <div>
              <label className={label}>El Ecuatoriano</label>
              <input name="ecuatorianoUrl" type="url" defaultValue={s.ecuatorianoUrl ?? ""} placeholder="https://…" className={input} />
            </div>
          </div>
        </section>

        <section className="space-y-3 border-t border-neutral-100 pt-5">
          <h2 className="font-extrabold text-neutral-900">SEO y redes (OpenGraph)</h2>
          <p className="text-xs text-neutral-500">
            Título, descripción e imagen por defecto que se muestran en Google y al compartir en redes.
          </p>
          <div>
            <label className={label}>Título SEO por defecto</label>
            <input name="seoTitle" defaultValue={s.seoTitle ?? ""} placeholder="Goals Ec — Listas, curiosidades y noticias" className={input} />
          </div>
          <div>
            <label className={label}>Descripción SEO por defecto</label>
            <textarea name="seoDescription" rows={2} defaultValue={s.seoDescription ?? ""} placeholder="Descripción que aparece en buscadores y redes…" className={`${input} resize-y`} />
          </div>
          <CoverImageField name="ogImage" fieldLabel="Imagen para compartir (OG, 1200×630)" defaultValue={s.ogImage} />
        </section>

        <section className="space-y-3 border-t border-neutral-100 pt-5">
          <h2 className="font-extrabold text-neutral-900">Analytics y anuncios</h2>
          <p className="text-xs text-neutral-500">
            Pega tus códigos. Déjalos vacíos para desactivarlos.
          </p>
          <div>
            <label className={label}>Google Analytics (ID de medición)</label>
            <input name="analyticsId" defaultValue={s.analyticsId ?? ""} placeholder="G-XXXXXXXXXX" className={input} />
          </div>
          <div>
            <label className={label}>Google AdSense (código de cliente)</label>
            <input name="adsenseClient" defaultValue={s.adsenseClient ?? ""} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className={input} />
          </div>
        </section>

        <section className="space-y-3 border-t border-neutral-100 pt-5">
          <h2 className="font-extrabold text-neutral-900">Pop-up</h2>
          <p className="text-xs text-neutral-500">
            Ventana emergente que aparece al entrar al sitio (una vez por sesión). Reaparece cuando guardas cambios en su contenido.
          </p>
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <input type="checkbox" name="popupEnabled" defaultChecked={s.popupEnabled} className="h-4 w-4" />
            Mostrar el pop-up en el sitio
          </label>
          <div>
            <label className={label}>Título</label>
            <input name="popupTitle" defaultValue={s.popupTitle ?? ""} placeholder="¡Bienvenido a Goals Ec!" className={input} />
          </div>
          <div>
            <label className={label}>Texto</label>
            <textarea name="popupBody" rows={3} defaultValue={s.popupBody ?? ""} placeholder="Mensaje del pop-up…" className={`${input} resize-y`} />
          </div>
          <CoverImageField name="popupImage" fieldLabel="Imagen (opcional)" defaultValue={s.popupImage} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Texto del botón (opcional)</label>
              <input name="popupCtaLabel" defaultValue={s.popupCtaLabel ?? ""} placeholder="Ver más" className={input} />
            </div>
            <div>
              <label className={label}>Enlace del botón (opcional)</label>
              <input name="popupCtaUrl" type="url" defaultValue={s.popupCtaUrl ?? ""} placeholder="https://…" className={input} />
            </div>
          </div>
        </section>

        <button className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
