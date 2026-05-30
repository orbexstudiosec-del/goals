import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, tags] = await Promise.all([
    prisma.article
      .findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      })
      .catch(() => []),
    prisma.category
      .findMany({ select: { slug: true, updatedAt: true } })
      .catch(() => []),
    prisma.tag
      .findMany({ select: { slug: true, createdAt: true } })
      .catch(() => []),
  ]);

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/buscar`,
      changeFrequency: "weekly",
      priority: 0.3,
    },
    ...categories.map((c) => ({
      url: `${siteConfig.url}/categoria/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...tags.map((t) => ({
      url: `${siteConfig.url}/tag/${t.slug}`,
      lastModified: t.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...articles.map((a) => ({
      url: `${siteConfig.url}/articulo/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
