/** Bandera de Ecuador como SVG (los emojis de bandera no renderizan en Windows). */
export function FlagEc({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Ecuador"
      role="img"
      className={`inline-block overflow-hidden rounded-[2px] align-[-0.1em] shadow-sm ring-1 ring-black/10 ${className}`}
      style={{ width: "1.3em", height: "0.86em" }}
    >
      <span className="block bg-[#FFDD00]" style={{ height: "50%" }} />
      <span className="block bg-[#034EA2]" style={{ height: "25%" }} />
      <span className="block bg-[#ED1C24]" style={{ height: "25%" }} />
    </span>
  );
}
