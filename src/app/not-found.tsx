import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl font-black text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-neutral-900">Página no encontrada</h1>
      <p className="mt-2 text-neutral-600">
        Lo que buscabas no existe o fue movido a otra dirección.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-brand-500 px-5 py-2.5 font-semibold text-white hover:bg-brand-600"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
