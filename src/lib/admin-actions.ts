"use server";

import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";
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
  revalidatePath("/");
}

export async function togglePinned(postId: string): Promise<void> {
  await requireAdmin();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { pinned: true } });
  await prisma.post.update({ where: { id: postId }, data: { pinned: !post?.pinned } });
  revalidatePath("/admin/comunidad");
  revalidatePath("/");
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
  revalidatePath("/");
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
    await prisma.article.update({ where: { id }, data });
  } else {
    await prisma.article.create({ data: { ...data, slug } });
  }

  revalidatePath("/admin/articulos");
  revalidatePath("/");
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
  revalidatePath("/");
}

export async function deleteArticle(id: string): Promise<void> {
  await requireAdmin();
  await prisma.article.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/articulos");
  revalidatePath("/");
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
  revalidatePath("/");
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
  revalidatePath("/");
}
