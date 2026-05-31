import type { Metadata } from "next";
import { ZoneFeed } from "@/components/ZoneFeed";

export const metadata: Metadata = {
  title: "El Confesionario",
  description: "Confesiones e historias anónimas de la comunidad. Aquí nadie te juzga.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ orden?: string }>;

export default async function ConfesionarioPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { orden } = await searchParams;
  return (
    <ZoneFeed
      type="CONFESSION"
      title="El Confesionario 🤫"
      description="Historias y confesiones anónimas. Aquí nadie te juzga."
      basePath="/confesionario"
      orden={orden}
    />
  );
}
