import type { Metadata } from "next";
import { CreatePostForm } from "@/components/CreatePostForm";
import { getNickname } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Publicar",
  description: "Escribe una confesión anónima en la comunidad de Goals Ec.",
};

export const dynamic = "force-dynamic";

export default async function PublicarPage() {
  const nickname = await getNickname();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-neutral-900 md:text-3xl">
        Publicar una confesión
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Es 100% anónimo. Cuéntanos lo que quieras compartir.
      </p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <CreatePostForm nickname={nickname} />
      </div>
    </div>
  );
}
