"use client";

import { createContext, useContext } from "react";

const AdsenseContext = createContext<string | null>(null);

export function AdsenseProvider({
  client,
  children,
}: {
  client: string | null;
  children: React.ReactNode;
}) {
  return <AdsenseContext.Provider value={client}>{children}</AdsenseContext.Provider>;
}

/** Devuelve el código de cliente de AdSense (ca-pub-...) o null si no está configurado. */
export function useAdsenseClient(): string | null {
  return useContext(AdsenseContext);
}
