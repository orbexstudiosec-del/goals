"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Editor visual (WYSIWYG) tipo WordPress, sin dependencias externas.
 * Usa un div contentEditable + document.execCommand y sincroniza el HTML
 * a un <textarea> oculto con el `name` indicado para que el formulario lo envíe.
 * Incluye un modo "HTML" para editar el código directamente.
 */

type Cmd = { icon: string; title: string; run: () => void };

const btn =
  "flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-bold text-neutral-700 transition hover:bg-neutral-200 active:scale-95";
const sep = <span className="mx-0.5 h-5 w-px bg-neutral-300" aria-hidden />;

export function RichTextEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [imgUploading, setImgUploading] = useState(false);

  // Carga inicial del contenido en el editor visual y en el campo oculto.
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = defaultValue;
    if (fieldRef.current) fieldRef.current.value = defaultValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => {
    if (editorRef.current && fieldRef.current) {
      fieldRef.current.value = editorRef.current.innerHTML;
    }
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  };

  const addLink = () => {
    const url = window.prompt("URL del enlace:", "https://");
    if (url) exec("createLink", url);
  };

  const onImagePick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        editorRef.current?.focus();
        document.execCommand(
          "insertHTML",
          false,
          `<img src="${data.url}" alt="" style="max-width:100%;height:auto;display:block;margin:8px auto;">`,
        );
        sync();
      }
    } finally {
      setImgUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMode = () => {
    if (mode === "visual") {
      // Pasar a HTML: el textarea ya está sincronizado.
      sync();
      setMode("html");
    } else {
      // Volver a visual: cargar el HTML editado en el editor.
      if (editorRef.current && fieldRef.current) {
        editorRef.current.innerHTML = fieldRef.current.value;
      }
      setMode("visual");
    }
  };

  const groups: Cmd[][] = [
    [
      { icon: "B", title: "Negrita", run: () => exec("bold") },
      { icon: "I", title: "Cursiva", run: () => exec("italic") },
      { icon: "U", title: "Subrayado", run: () => exec("underline") },
      { icon: "S", title: "Tachado", run: () => exec("strikeThrough") },
    ],
    [
      { icon: "P", title: "Párrafo", run: () => exec("formatBlock", "<p>") },
      { icon: "H2", title: "Título", run: () => exec("formatBlock", "<h2>") },
      { icon: "H3", title: "Subtítulo", run: () => exec("formatBlock", "<h3>") },
      { icon: "❝", title: "Cita", run: () => exec("formatBlock", "<blockquote>") },
    ],
    [
      { icon: "•", title: "Lista con viñetas", run: () => exec("insertUnorderedList") },
      { icon: "1.", title: "Lista numerada", run: () => exec("insertOrderedList") },
    ],
    [
      { icon: "⫷", title: "Alinear a la izquierda", run: () => exec("justifyLeft") },
      { icon: "≡", title: "Centrar", run: () => exec("justifyCenter") },
      { icon: "⫸", title: "Alinear a la derecha", run: () => exec("justifyRight") },
      { icon: "▤", title: "Justificar", run: () => exec("justifyFull") },
    ],
    [
      { icon: "🔗", title: "Insertar enlace", run: addLink },
      { icon: "⛓", title: "Quitar enlace", run: () => exec("unlink") },
      { icon: "⌫", title: "Limpiar formato", run: () => exec("removeFormat") },
    ],
  ];

  return (
    <div className="rounded-lg border border-neutral-300 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-accent">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 p-1.5">
        {groups.map((g, gi) => (
          <span key={gi} className="flex items-center gap-0.5">
            {gi > 0 && sep}
            {g.map((c) => (
              <button
                key={c.title}
                type="button"
                title={c.title}
                // Evita que el botón robe la selección del editor.
                onMouseDown={(e) => e.preventDefault()}
                onClick={c.run}
                disabled={mode === "html"}
                className={`${btn} disabled:opacity-30`}
              >
                {c.icon}
              </button>
            ))}
          </span>
        ))}
        {sep}
        <button
          type="button"
          title="Insertar imagen en el contenido"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => imgInputRef.current?.click()}
          disabled={mode === "html" || imgUploading}
          className="flex h-8 items-center gap-1.5 rounded bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-40"
        >
          {imgUploading ? "Subiendo…" : "🖼 Imagen"}
        </button>

        <span className="ml-auto flex items-center gap-0.5">
          {sep}
          <button
            type="button"
            title="Ver/editar HTML"
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggleMode}
            className={`${btn} ${mode === "html" ? "bg-neutral-900 text-white hover:bg-neutral-800" : ""}`}
          >
            {"</>"}
          </button>
        </span>
      </div>

      {/* Editor visual */}
      <div
        ref={editorRef}
        contentEditable={mode === "visual"}
        suppressContentEditableWarning
        onInput={sync}
        role="textbox"
        aria-multiline="true"
        className={`article-body min-h-[320px] max-w-none overflow-auto px-4 py-3 outline-none ${
          mode === "html" ? "hidden" : ""
        }`}
      />

      <input
        ref={imgInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={onImagePick}
        className="hidden"
      />

      {/* Editor HTML (también es el campo que envía el formulario) */}
      <textarea
        ref={fieldRef}
        name={name}
        onChange={() => {
          /* en modo HTML el usuario escribe aquí directamente */
        }}
        className={`min-h-[320px] w-full resize-y px-4 py-3 font-mono text-xs outline-none ${
          mode === "html" ? "block" : "hidden"
        }`}
      />
    </div>
  );
}
