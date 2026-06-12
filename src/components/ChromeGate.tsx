"use client";

import { usePathname } from "next/navigation";

/**
 * Oculta el chrome público (banners, header, footer, pop-up, analytics) en las
 * rutas /admin. Al ser cliente y usar usePathname, funciona también en la
 * navegación del lado del cliente (el layout raíz no se re-renderiza solo).
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
