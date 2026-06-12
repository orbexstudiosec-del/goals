import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@prisma/client";
import { siteConfig } from "@/lib/site";
import { socialLinks } from "@/lib/settings";

export function Footer({ settings }: { settings: SiteSettings }) {
  const socials = socialLinks(settings);
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Image
              src="/logo.png"
              alt={siteConfig.name}
              width={400}
              height={336}
              className="h-14 w-auto"
            />
            <p className="mt-3 text-sm text-neutral-600">{siteConfig.description}</p>
            {socials.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-neutral-700 hover:text-neutral-900"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900">Comunidad</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/memes" className="hover:text-neutral-900">
                  Memes
                </Link>
              </li>
              <li>
                <Link href="/confesionario" className="hover:text-neutral-900">
                  El Confesionario
                </Link>
              </li>
              <li>
                <Link href="/publicar" className="hover:text-neutral-900">
                  Publicar
                </Link>
              </li>
              <li>
                <Link href="/buscar" className="hover:text-neutral-900">
                  Buscar
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/privacidad" className="hover:text-neutral-900">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-neutral-900">
                  Términos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-neutral-900">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          {" · "}
          <Link href="/admin" className="hover:text-neutral-900">
            Admin
          </Link>
          {" · "}
          <span className="text-neutral-400">v1.0</span>
        </p>
      </div>
    </footer>
  );
}
