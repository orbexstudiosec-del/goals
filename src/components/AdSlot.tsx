"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/site";

type AdSlotProps = {
  slot: string;
  format?: "auto" | "fluid" | "rectangle";
  layout?: "in-article" | "in-feed";
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSlot({ slot, format = "auto", layout, className = "" }: AdSlotProps) {
  useEffect(() => {
    if (!siteConfig.adsenseClient) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore
    }
  }, []);

  if (!siteConfig.adsenseClient) {
    return (
      <div
        className={`flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-400 ${className}`}
        aria-hidden
      >
        Espacio reservado para AdSense ({slot})
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={siteConfig.adsenseClient}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-full-width-responsive="true"
    />
  );
}
