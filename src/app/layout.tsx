import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { SocialBanner } from "@/components/SocialBanner";
import { SecondBanner } from "@/components/SecondBanner";
import { SitePopup } from "@/components/SitePopup";
import { AdsenseProvider } from "@/components/AdsenseProvider";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const defaultTitle = s.seoTitle?.trim() || `${siteConfig.name} — Listas, curiosidades y noticias`;
  const description = s.seoDescription?.trim() || siteConfig.description;
  const ogImage = s.ogImage?.trim() || "/og-default.png";

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: defaultTitle,
      template: `%s · ${siteConfig.name}`,
    },
    description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name }],
    generator: "Next.js",
    keywords: ["curiosidades", "listas", "noticias", "ecuador", "top", "virales"],
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: defaultTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description,
      creator: siteConfig.twitter,
      images: [ogImage],
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: "/apple-icon.png",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");
  const settings = isAdmin ? null : await getSiteSettings();

  // Códigos configurables desde el admin (con respaldo a variable de entorno).
  const adsenseClient = settings?.adsenseClient?.trim() || siteConfig.adsenseClient || null;
  const analyticsId = settings?.analyticsId?.trim() || null;

  return (
    <html lang="es-EC">
      <body className="flex min-h-screen flex-col bg-[#fbf6f1] text-neutral-900">
        {adsenseClient && !isAdmin && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {analyticsId && !isAdmin && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${analyticsId}');`}
            </Script>
          </>
        )}
        <AdsenseProvider client={isAdmin ? null : adsenseClient}>
          {settings && <SocialBanner settings={settings} />}
          {settings && <SecondBanner settings={settings} />}
          {!isAdmin && <Header />}
          <main className="flex-1">{children}</main>
          {settings && <Footer settings={settings} />}
          {settings?.popupEnabled && (settings.popupTitle || settings.popupBody || settings.popupImage) && (
            <SitePopup
              version={settings.updatedAt.toISOString()}
              title={settings.popupTitle}
              body={settings.popupBody}
              image={settings.popupImage}
              ctaLabel={settings.popupCtaLabel}
              ctaUrl={settings.popupCtaUrl}
            />
          )}
          {!isAdmin && <Analytics />}
        </AdsenseProvider>
      </body>
    </html>
  );
}
