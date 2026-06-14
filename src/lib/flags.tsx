import React from "react";

/**
 * Conversión de emojis de bandera (regional indicators, ej. 🇩🇪) a imágenes
 * reales (flagcdn.com), del lado del servidor — Windows/Chrome no los renderiza.
 * Seguro: no muta el DOM, React produce el marcado correcto desde el inicio.
 */

const FLAG_RE = /[\u{1F1E6}-\u{1F1FF}]{2}/u;
const FLAG_RE_G = /[\u{1F1E6}-\u{1F1FF}]{2}/gu;

function pairToCode(pair: string): string {
  const a = (pair.codePointAt(0) ?? 0) - 0x1f1e6;
  const b = (pair.codePointAt(2) ?? 0) - 0x1f1e6;
  return String.fromCharCode(97 + a) + String.fromCharCode(97 + b); // ej. "de", "ec"
}

/** Para texto plano (títulos, extractos): devuelve nodos React con <img> de bandera. */
export function withFlags(text: string | null | undefined): React.ReactNode {
  if (!text) return text ?? null;
  if (!FLAG_RE.test(text)) return text;

  const parts = text.split(FLAG_RE_G);
  const flags = text.match(FLAG_RE_G) ?? [];
  const out: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part) out.push(part);
    if (i < flags.length) {
      const code = pairToCode(flags[i]);
      out.push(
        <img
          key={`f${i}`}
          src={`https://flagcdn.com/w40/${code}.png`}
          srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
          alt={code.toUpperCase()}
          loading="lazy"
          className="inline-block h-[1em] w-auto rounded-[2px] align-[-0.15em] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
          style={{ margin: "0 0.1em" }}
        />,
      );
    }
  });
  return out;
}

/** Para HTML (contenido de artículos): reemplaza los emojis por etiquetas <img>. */
export function flagsToHtml(html: string): string {
  return html.replace(FLAG_RE_G, (m) => {
    const code = pairToCode(m);
    return `<img src="https://flagcdn.com/w40/${code}.png" srcset="https://flagcdn.com/w80/${code}.png 2x" alt="${code.toUpperCase()}" loading="lazy" style="display:inline-block;height:1em;width:auto;vertical-align:-0.15em;border-radius:2px;margin:0 .1em;box-shadow:0 0 0 1px rgba(0,0,0,.08)" />`;
  });
}
