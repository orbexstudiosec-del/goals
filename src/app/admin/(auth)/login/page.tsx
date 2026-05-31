import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin · Acceso",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-2xl bg-white px-4 py-3">
            <Image src="/logo.png" alt="Goals Ec" width={200} height={168} className="h-12 w-auto" />
          </div>
          <h1 className="mt-4 text-lg font-extrabold text-white">Panel de administración</h1>
          <p className="text-sm text-white/60">Ingresa con tu cuenta de admin</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
