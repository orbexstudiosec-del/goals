import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getParticipant } from "@/lib/participant-auth";
import { PLoginForm } from "@/components/pronosticos/PLoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión · Pronósticos",
  description: "Ingresa a tu cuenta de pronósticos de Goals Ec.",
};

export const dynamic = "force-dynamic";

export default async function IngresarPage() {
  if (await getParticipant()) redirect("/pronosticos");

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-black text-neutral-900 md:text-3xl">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-neutral-600">Entra para seguir pronosticando.</p>
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <PLoginForm />
      </div>
    </div>
  );
}
