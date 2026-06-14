import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getParticipant } from "@/lib/participant-auth";
import { RegisterForm } from "@/components/pronosticos/RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta · Pronósticos Mundial 2026",
  description: "Regístrate para pronosticar el Mundial 2026 y participar en los sorteos de Goals Ec.",
};

export const dynamic = "force-dynamic";

export default async function RegistroPage() {
  if (await getParticipant()) redirect("/pronosticos");

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-black text-neutral-900 md:text-3xl">Crea tu cuenta</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Regístrate gratis para pronosticar el Mundial 2026 y ganar boletos para los sorteos. 🎁
      </p>
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
