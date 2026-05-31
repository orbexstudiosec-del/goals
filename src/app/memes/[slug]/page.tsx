import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import { PostDetailView } from "@/components/PostDetailView";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "MEME");
  if (!post) return {};
  return {
    title: post.title || "Meme",
    description: post.title || "Un meme de la comunidad",
    openGraph: { images: post.imageUrl ? [post.imageUrl] : undefined },
  };
}

export default async function MemeDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "MEME");
  if (!post) notFound();
  return <PostDetailView post={post} />;
}
