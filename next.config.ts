import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Servimos las imágenes directamente (sin el optimizador /_next/image),
    // que fallaba con las subidas locales servidas por Caddy. next/image sigue
    // dando lazy-loading y layout; las imágenes se entregan tal cual.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
