import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const IMAGE_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

/** Valida y guarda un archivo de imagen en /public/uploads. Devuelve la ruta pública. */
export async function saveImageUpload(file: File): Promise<string> {
  const ext = IMAGE_EXT[file.type];
  if (!ext) throw new Error("Formato no permitido. Usa PNG, JPG, GIF o WEBP.");
  if (file.size === 0) throw new Error("Archivo vacío.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("La imagen supera los 5 MB.");

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}
