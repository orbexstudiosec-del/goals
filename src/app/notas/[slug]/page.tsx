import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import { PostDetailView } from "@/components/PostDetailView";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "NOTE");
  if (!post) return {};
  return {
    title: post.title || "Nota curiosa",
    description: post.body?.slice(0, 150) || "Una nota curiosa de la comunidad",
  };
}

export default async function NotaDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "NOTE");
  if (!post) notFound();
  return <PostDetailView post={post} />;
}
