"use server";

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";
import { saveImageUpload } from "@/lib/upload";
import {
  requireAdmin,
  verifyCredentials,
  startSession,
  endSession,
} from "@/lib/auth";
import type { ModStatus } from "@prisma/client";

// ─────────────────────────────────────────── Auth

export async function login(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const admin = await verifyCredentials(email, password);
  if (!admin) return { error: "Email o contraseña incorrectos." };
  await startSession(admin.id);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

// ─────────────────────────────────────────── Moderación de posts

export async function setPostStatus(postId: string, status: ModStatus): Promise<void> {
  await requireAdmin();
  await prisma.post.update({ where: { id: postId }, data: { status } });
  revalidatePath("/admin/comunidad");
  revalidatePath("/", "layout");
}

export async function togglePinned(postId: string): Promise<void> {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { pinned: true } });
  await prisma.post.update({ where: { id: postId }, data: { pinned: !post?.pinned } });
  revalidatePath("/admin/comunidad");
  revalidatePath("/", "layout");
}

export async function deletePost(postId: string): Promise<void> {
  await requireAdmin();
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { imageUrl: true },
  });
  await prisma.post.delete({ where: { id: postId } });
  // Borra la imagen subida si era local
  if (post?.imageUrl?.startsWith("/uploads/")) {
    await fs
      .unlink(path.join(process.cwd(), "public", post.imageUrl))
      .catch(() => null);
  }
  revalidatePath("/admin/comunidad");
  revalidatePath("/", "layout");
}

// ─────────────────────────────────────────── Memes (solo admin)

export async function adminCreateMeme(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Debes seleccionar una imagen.");
  }
  const imageUrl = await saveImageUpload(file);

  const caption = String(formData.get("title") ?? "").trim().slice(0, 140);
  const width = Number(formData.get("imageWidth")) || null;
  const height = Number(formData.get("imageHeight")) || null;
  const root = toSlug(caption).slice(0, 60) || "meme";

  const post = await prisma.post.create({
    data: {
      type: "MEME",
      status: "PUBLISHED",
      slug: `${root}-${randomUUID().slice(0, 6)}`,
      title: caption || null,
      imageUrl,
      imageWidth: width,
      imageHeight: height,
      authorName: admin.name,
      authorToken: `admin:${admin.id}`,
    },
  });

  revalidatePath("/memes");
  revalidatePath("/", "layout");
  redirect(`/memes/${post.slug}`);
}

// ─────────────────────────────────────────── Moderación de comentarios

export async function deleteComment(commentId: string): Promise<void> {
  await requireAdmin();
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { postId: true },
  });
  if (!comment) return;
  await prisma.$transaction([
    prisma.comment.delete({ where: { id: commentId } }),
    prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    }),
  ]);
  revalidatePath("/admin/comentarios");
}

// ─────────────────────────────────────────── Artículos

function num(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const SHORT_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // sin caracteres ambiguos

/** Genera un código corto único para enlaces /e/<code>. */
async function generateShortCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = randomUUID().replace(/-/g, "");
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += SHORT_ALPHABET[parseInt(bytes[i], 16) % SHORT_ALPHABET.length];
    }
    const exists = await prisma.article.findUnique({ where: { shortCode: code }, select: { id: true } });
    if (!exists) return code;
  }
  // Fallback prácticamente imposible de colisionar
  return randomUUID().slice(0, 8);
}

export async function saveArticle(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = (formData.get("id") as string) || null;
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const coverImage = String(formData.get("coverImage") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";

  if (!title || !excerpt || !content || !categoryId) {
    throw new Error("Faltan campos obligatorios (título, extracto, contenido, categoría).");
  }

  const slug =
    String(formData.get("slug") ?? "").trim() || toSlug(title);

  const data = {
    title,
    excerpt,
    content,
    categoryId,
    coverImage,
    coverImageAlt: title,
    metaTitle: String(formData.get("metaTitle") ?? "").trim() || title,
    metaDescription: String(formData.get("metaDescription") ?? "").trim() || excerpt,
    published,
    featured,
    readingMinutes: Math.max(1, num(formData.get("readingMinutes"), Math.round(content.length / 1000) || 3)),
    publishedAt: published ? new Date() : null,
  };

  if (id) {
    // Asigna un código corto si la entrada aún no tiene uno.
    const existing = await prisma.article.findUnique({ where: { id }, select: { shortCode: true } });
    const shortCode = existing?.shortCode ?? (await generateShortCode());
    await prisma.article.update({ where: { id }, data: { ...data, shortCode } });
  } else {
    await prisma.article.create({ data: { ...data, slug, shortCode: await generateShortCode() } });
  }

  revalidatePath("/admin/articulos");
  revalidatePath("/", "layout");
  redirect("/admin/articulos");
}

export async function toggleArticlePublished(id: string): Promise<void> {
  await requireAdmin();
  const a = await prisma.article.findUnique({
    where: { id },
    select: { published: true },
  });
  const willPublish = !a?.published;
  await prisma.article.update({
    where: { id },
    data: { published: willPublish, publishedAt: willPublish ? new Date() : null },
  });
  revalidatePath("/admin/articulos");
  revalidatePath("/", "layout");
}

export async function deleteArticle(id: string): Promise<void> {
  await requireAdmin();
  await prisma.article.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/articulos");
  revalidatePath("/", "layout");
}

// ─────────────────────────────────────────── Ajustes del sitio

function urlOrNull(value: FormDataEntryValue | null): string | null {
  const v = String(value ?? "").trim();
  return v.length ? v : null;
}

export async function saveSiteSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  const data = {
    bannerEnabled: formData.get("bannerEnabled") === "on",
    bannerText:
      String(formData.get("bannerText") ?? "").trim() ||
      "¡Síguenos en redes y no te pierdas nada de Goals Ec!",
    facebookUrl: urlOrNull(formData.get("facebookUrl")),
    instagramUrl: urlOrNull(formData.get("instagramUrl")),
    tiktokUrl: urlOrNull(formData.get("tiktokUrl")),
    youtubeUrl: urlOrNull(formData.get("youtubeUrl")),
    xUrl: urlOrNull(formData.get("xUrl")),
    whatsappUrl: urlOrNull(formData.get("whatsappUrl")),

    popupEnabled: formData.get("popupEnabled") === "on",
    popupTitle: urlOrNull(formData.get("popupTitle")),
    popupBody: urlOrNull(formData.get("popupBody")),
    popupImage: urlOrNull(formData.get("popupImage")),
    popupCtaLabel: urlOrNull(formData.get("popupCtaLabel")),
    popupCtaUrl: urlOrNull(formData.get("popupCtaUrl")),

    seoTitle: urlOrNull(formData.get("seoTitle")),
    seoDescription: urlOrNull(formData.get("seoDescription")),
    ogImage: urlOrNull(formData.get("ogImage")),

    analyticsId: urlOrNull(formData.get("analyticsId")),
    adsenseClient: urlOrNull(formData.get("adsenseClient")),

    secondBannerEnabled: formData.get("secondBannerEnabled") === "on",
    secondBannerColor: String(formData.get("secondBannerColor") ?? "#1d4ed8").trim() || "#1d4ed8",
    goalsUrl: urlOrNull(formData.get("goalsUrl")),
    tulcanenoUrl: urlOrNull(formData.get("tulcanenoUrl")),
    stevenUrl: urlOrNull(formData.get("stevenUrl")),
    ecuatorianoUrl: urlOrNull(formData.get("ecuatorianoUrl")),
  };

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/", "layout");
  redirect("/admin/ajustes?ok=1");
}

// ─────────────────────────────────────────── Categorías

export async function saveCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = (formData.get("id") as string) || null;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const color = String(formData.get("color") ?? "#ffd31a").trim();
  const order = num(formData.get("order"), 0);
  if (!name) throw new Error("El nombre es obligatorio.");

  if (id) {
    await prisma.category.update({ where: { id }, data: { name, description, color, order } });
  } else {
    await prisma.category.create({
      data: { name, slug: toSlug(name), description, color, order },
    });
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/", "layout");
  redirect("/admin/categorias");
}

export async function deleteCategory(id: string): Promise<{ error?: string } | void> {
  await requireAdmin();
  const count = await prisma.article.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error(`No se puede borrar: la categoría tiene ${count} artículo(s).`);
  }
  await prisma.category.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/categorias");
  revalidatePath("/", "layout");
}
