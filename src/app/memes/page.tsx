import type { Metadata } from "next";
import { ZoneFeed } from "@/components/ZoneFeed";

export const metadata: Metadata = {
  title: "Memes",
  description: "Los memes más virales subidos por la comunidad. Vota, reacciona y comparte.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ orden?: string }>;

export default async function MemesPage({ searchParams }: { searchParams: SearchParams }) {
  const { orden } = await searchParams;
  return (
    <ZoneFeed
      type="MEME"
      title="Memes 😂"
      description="Los memes más virales subidos por la comunidad."
      basePath="/memes"
      orden={orden}
    />
  );
}
