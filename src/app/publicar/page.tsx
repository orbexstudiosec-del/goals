import type { Metadata } from "next";
import { CreatePostForm } from "@/components/CreatePostForm";
import { getNickname } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Publicar",
  description: "Sube un meme, escribe una confesión anónima o comparte una nota curiosa.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ tipo?: string }>;

export default async function PublicarPage({ searchParams }: { searchParams: SearchParams }) {
  const { tipo } = await searchParams;
  const nickname = await getNickname();
  const initialTab =
    tipo === "confesion" ? "CONFESSION" : tipo === "nota" ? "NOTE" : "MEME";

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-neutral-900 md:text-3xl">
        Publicar en la comunidad
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Es 100% anónimo. Elige qué quieres compartir.
      </p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <CreatePostForm nickname={nickname} initialTab={initialTab} />
      </div>
    </div>
  );
}
