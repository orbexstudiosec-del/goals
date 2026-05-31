import type { Metadata } from "next";
import { ZoneFeed } from "@/components/ZoneFeed";

export const metadata: Metadata = {
  title: "Notas curiosas",
  description: "Datos y curiosidades cortas que aporta la comunidad.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ orden?: string }>;

export default async function NotasPage({ searchParams }: { searchParams: SearchParams }) {
  const { orden } = await searchParams;
  return (
    <ZoneFeed
      type="NOTE"
      title="Notas curiosas 💡"
      description="Datos y curiosidades cortas que aporta la comunidad."
      basePath="/notas"
      orden={orden}
    />
  );
}
