import { logoutParticipant } from "@/lib/pronosticos";

export function PLogoutButton() {
  return (
    <form action={logoutParticipant}>
      <button
        type="submit"
        className="text-sm font-semibold text-neutral-500 underline transition hover:text-neutral-900"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
