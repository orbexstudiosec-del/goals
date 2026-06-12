import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const article = await prisma.article
    .findUnique({ where: { shortCode: code }, select: { slug: true, published: true } })
    .catch(() => null);

  const target =
    article && article.published ? `/articulo/${article.slug}` : "/";
  return NextResponse.redirect(new URL(target, siteConfig.url), 308);
}
