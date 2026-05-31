import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Admin Goals Ec" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 flex-col bg-neutral-950 p-4 md:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2">
          <div className="rounded-xl bg-white px-2 py-1.5">
            <Image src="/logo.png" alt="Goals Ec" width={160} height={134} className="h-7 w-auto" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">Admin</span>
        </Link>

        <AdminNav />

        <div className="mt-auto space-y-2 border-t border-neutral-800 pt-3">
          <p className="px-3 text-xs text-neutral-500">
            <span className="block font-semibold text-neutral-300">{admin.name}</span>
            {admin.email}
          </p>
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            ↗ Ver sitio
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Top bar móvil */}
      <div className="flex w-full flex-col">
        <header className="flex items-center justify-between bg-neutral-950 px-4 py-3 md:hidden">
          <Link href="/admin" className="rounded-lg bg-white px-2 py-1">
            <Image src="/logo.png" alt="Goals Ec" width={120} height={100} className="h-7 w-auto" />
          </Link>
          <div className="w-36">
            <LogoutButton />
          </div>
        </header>
        <div className="bg-neutral-900 px-3 py-2 md:hidden">
          <AdminNav />
        </div>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
