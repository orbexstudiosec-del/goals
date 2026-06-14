"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Windows/Chrome no renderiza los emojis de bandera (regional indicators):
 * 🇩🇪 se ve como "DE". Este componente recorre el DOM y reemplaza esos emojis
 * por imágenes reales de banderas (flagcdn.com), en cualquier contenido del
 * sitio (artículos, títulos, comentarios, etc.) sin tener que tocar cada página.
 */

// Pares de "regional indicators" (🇦..🇿). Cada emoji ocupa 2 unidades UTF-16.
const FLAG_RE = /[\u{1F1E6}-\u{1F1FF}]{2}/gu;

function pairToCode(pair: string): string {
  const a = (pair.codePointAt(0) ?? 0) - 0x1f1e6;
  const b = (pair.codePointAt(2) ?? 0) - 0x1f1e6;
  return String.fromCharCode(97 + a) + String.fromCharCode(97 + b); // ej. "de", "ec"
}

function makeFlagImg(code: string): HTMLImageElement {
  const img = document.createElement("img");
  img.src = `https://flagcdn.com/w40/${code}.png`;
  img.srcset = `https://flagcdn.com/w80/${code}.png 2x`;
  img.alt = code.toUpperCase();
  img.loading = "lazy";
  img.dataset.flagEmoji = "1";
  img.style.cssText =
    "display:inline-block;height:1em;width:auto;vertical-align:-0.15em;border-radius:2px;margin:0 0.1em;box-shadow:0 0 0 1px rgba(0,0,0,.08)";
  return img;
}

function replaceInTextNode(node: Text): void {
  const text = node.nodeValue ?? "";
  FLAG_RE.lastIndex = 0;
  if (!FLAG_RE.test(text)) return;

  const frag = document.createDocumentFragment();
  let last = 0;
  FLAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = FLAG_RE.exec(text)) !== null) {
    if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
    frag.appendChild(makeFlagImg(pairToCode(m[0])));
    last = m.index + m[0].length;
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  node.parentNode?.replaceChild(frag, node);
}

function fixFlags(): void {
  const root = document.body;
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const t = node.nodeValue;
      if (!t) return NodeFilter.FILTER_REJECT;
      // No tocar scripts/estilos ni nodos ya procesados.
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "TEXTAREA") {
        return NodeFilter.FILTER_REJECT;
      }
      FLAG_RE.lastIndex = 0;
      return FLAG_RE.test(t) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const targets: Text[] = [];
  while (walker.nextNode()) targets.push(walker.currentNode as Text);
  targets.forEach(replaceInTextNode);
}

export function FlagEmojiFix() {
  const pathname = usePathname();

  useEffect(() => {
    // Espera un frame para que el contenido (incl. HTML de artículos) esté montado.
    const id = window.requestAnimationFrame(fixFlags);
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
