import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function isValidImageFilename(filename: string): boolean {
  return (
    typeof filename === "string" &&
    filename.length > 0 &&
    filename.length <= 255 &&
    path.basename(filename) === filename &&
    !filename.includes("..") &&
    /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(filename)
  );
}

function filePath(filename: string) {
  return path.join(UPLOADS_DIR, filename);
}

export async function saveImage(buffer: Buffer, contentType: string): Promise<string> {
  const ext = ALLOWED_IMAGE_TYPES[contentType];
  if (!ext) throw new Error("Unsupported content type");
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_SIZE) {
    throw new Error("Invalid file size");
  }
  const filename = `${randomUUID()}.${ext}`;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(filePath(filename), buffer);
  return filename;
}

export async function deleteImage(filename: string) {
  if (!isValidImageFilename(filename)) return;
  try {
    await unlink(filePath(filename));
  } catch {
    // ไม่มีไฟล์ให้ลบ (ENOENT) ก็ปล่อยผ่าน
  }
}

export async function readImage(
  filename: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!isValidImageFilename(filename)) return null;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_BY_EXT[ext];
  if (!contentType) return null;
  try {
    const buffer = await readFile(filePath(filename));
    return { buffer, contentType };
  } catch {
    return null;
  }
}
