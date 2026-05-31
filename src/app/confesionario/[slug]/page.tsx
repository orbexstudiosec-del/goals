import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import { PostDetailView } from "@/components/PostDetailView";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "CONFESSION");
  if (!post) return {};
  return {
    title: post.title || "Confesión anónima",
    description: post.body?.slice(0, 150) || "Una confesión anónima de la comunidad",
  };
}

export default async function ConfesionDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "CONFESSION");
  if (!post) notFound();
  return <PostDetailView post={post} />;
}
