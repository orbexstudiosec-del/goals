"use server";

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/slug";
import {
  getOrCreateAnonToken,
  displayName,
  rememberNickname,
} from "@/lib/identity";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

const PATHS_BY_TYPE: Record<string, string> = {
  MEME: "/memes",
  CONFESSION: "/confesionario",
  NOTE: "/notas",
};

async function uniqueSlug(base: string): Promise<string> {
  const root = toSlug(base).slice(0, 60) || "post";
  // Sufijo corto para garantizar unicidad sin colisiones prácticas.
  return `${root}-${randomUUID().slice(0, 6)}`;
}

function clampText(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

// ─────────────────────────────────────────── Crear posts

export async function createMeme(formData: FormData): Promise<void> {
  const token = await getOrCreateAnonToken();
  const name = displayName(String(formData.get("authorName") ?? ""));
  await rememberNickname(name);

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Debes seleccionar una imagen.");
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Formato no permitido. Usa PNG, JPG, GIF o WEBP.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen supera el límite de 5 MB.");
  }

  const caption = clampText(formData.get("title"), 140);
  const width = Number(formData.get("imageWidth")) || null;
  const height = Number(formData.get("imageHeight")) || null;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${EXT[file.type]}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes);

  const post = await prisma.post.create({
    data: {
      type: "MEME",
      slug: await uniqueSlug(caption || "meme"),
      title: caption || null,
      imageUrl: `/uploads/${filename}`,
      imageWidth: width,
      imageHeight: height,
      authorName: name,
      authorToken: token,
    },
  });

  revalidatePath("/memes");
  revalidatePath("/");
  redirect(`/memes/${post.slug}`);
}

export async function createConfession(formData: FormData): Promise<void> {
  const token = await getOrCreateAnonToken();
  const name = displayName(String(formData.get("authorName") ?? ""));
  await rememberNickname(name);

  const title = clampText(formData.get("title"), 140);
  const body = clampText(formData.get("body"), 5000);
  if (body.length < 5) throw new Error("Tu confesión es demasiado corta.");

  const post = await prisma.post.create({
    data: {
      type: "CONFESSION",
      slug: await uniqueSlug(title || body),
      title: title || null,
      body,
      authorName: name,
      authorToken: token,
    },
  });

  revalidatePath("/confesionario");
  revalidatePath("/");
  redirect(`/confesionario/${post.slug}`);
}

export async function createNote(formData: FormData): Promise<void> {
  const token = await getOrCreateAnonToken();
  const name = displayName(String(formData.get("authorName") ?? ""));
  await rememberNickname(name);

  const title = clampText(formData.get("title"), 140);
  const body = clampText(formData.get("body"), 3000);
  if (title.length < 3) throw new Error("Ponle un título a tu nota.");
  if (body.length < 5) throw new Error("Tu nota es demasiado corta.");

  const post = await prisma.post.create({
    data: {
      type: "NOTE",
      slug: await uniqueSlug(title),
      title,
      body,
      authorName: name,
      authorToken: token,
    },
  });

  revalidatePath("/notas");
  revalidatePath("/");
  redirect(`/notas/${post.slug}`);
}

// ─────────────────────────────────────────── Votos en posts

export type VoteState = { score: number; myVote: number };

export async function votePost(postId: string, value: 1 | -1): Promise<VoteState> {
  const token = await getOrCreateAnonToken();

  const existing = await prisma.vote.findUnique({
    where: { postId_voterToken: { postId, voterToken: token } },
  });

  if (existing && existing.value === value) {
    await prisma.vote.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.vote.update({ where: { id: existing.id }, data: { value } });
  } else {
    await prisma.vote.create({ data: { postId, voterToken: token, value } });
  }

  const agg = await prisma.vote.aggregate({
    where: { postId },
    _sum: { value: true },
  });
  const score = agg._sum.value ?? 0;
  await prisma.post.update({ where: { id: postId }, data: { score } });

  const myVote = existing && existing.value === value ? 0 : value;
  revalidatePath("/");
  return { score, myVote };
}

// ─────────────────────────────────────────── Reacciones emoji

export type ReactionState = Record<string, number>;

export async function reactPost(postId: string, emoji: string): Promise<void> {
  const token = await getOrCreateAnonToken();

  const existing = await prisma.reaction.findUnique({
    where: { postId_voterToken_emoji: { postId, voterToken: token, emoji } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { postId, voterToken: token, emoji } });
  }
}

// ─────────────────────────────────────────── Comentarios

export async function addComment(formData: FormData): Promise<void> {
  const token = await getOrCreateAnonToken();
  const name = displayName(String(formData.get("authorName") ?? ""));
  await rememberNickname(name);

  const postId = String(formData.get("postId") ?? "");
  const parentId = (formData.get("parentId") as string) || null;
  const body = clampText(formData.get("body"), 2000);
  const path = String(formData.get("path") ?? "/");

  if (!postId || body.length < 1) return;

  await prisma.$transaction([
    prisma.comment.create({
      data: { postId, parentId, body, authorName: name, authorToken: token },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    }),
  ]);

  revalidatePath(path);
}

export async function voteComment(commentId: string, value: 1 | -1): Promise<VoteState> {
  const token = await getOrCreateAnonToken();

  const existing = await prisma.commentVote.findUnique({
    where: { commentId_voterToken: { commentId, voterToken: token } },
  });

  if (existing && existing.value === value) {
    await prisma.commentVote.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.commentVote.update({ where: { id: existing.id }, data: { value } });
  } else {
    await prisma.commentVote.create({ data: { commentId, voterToken: token, value } });
  }

  const agg = await prisma.commentVote.aggregate({
    where: { commentId },
    _sum: { value: true },
  });
  const score = agg._sum.value ?? 0;
  await prisma.comment.update({ where: { id: commentId }, data: { score } });

  const myVote = existing && existing.value === value ? 0 : value;
  return { score, myVote };
}

// ─────────────────────────────────────────── Moderación mínima

export async function reportPost(postId: string): Promise<void> {
  await prisma.post.update({
    where: { id: postId },
    data: { status: "PENDING" },
  });
  revalidatePath("/");
}
