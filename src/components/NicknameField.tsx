"use client";

type Props = {
  defaultValue?: string;
  className?: string;
};

export function NicknameField({ defaultValue = "", className = "" }: Props) {
  return (
    <input
      type="text"
      name="authorName"
      defaultValue={defaultValue}
      maxLength={40}
      placeholder="Tu apodo (opcional, si no pones nada serás Anónimo)"
      className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${className}`}
    />
  );
}
