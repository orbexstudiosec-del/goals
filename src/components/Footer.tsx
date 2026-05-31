import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
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
            <div className="mt-4 flex gap-3 text-sm">
              <a
                href="https://www.facebook.com/goalsec593"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-700 hover:text-neutral-900"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/goalsec"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-700 hover:text-neutral-900"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@goalsec"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-700 hover:text-neutral-900"
              >
                TikTok
              </a>
            </div>
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
                <Link href="/notas" className="hover:text-neutral-900">
                  Notas curiosas
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
        </p>
      </div>
    </footer>
  );
}
