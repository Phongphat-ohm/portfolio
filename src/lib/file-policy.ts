export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^\.+/, "").slice(-180) || "file";
}

export function detectFileType(bytes: Uint8Array): string | null {
  const starts = (...signature: number[]) => signature.every((value, index) => bytes[index] === value);
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return "image/gif";
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(0, 5) === "%PDF-") return "application/pdf";
  return null;
}

export function publicationReference(id: string) {
  return { published: true, OR: [{ fileId: id }, { imageUrl: `/api/files/${id}` }] };
}

export const publicFileSelect = {
  id: true, filename: true, url: true, mimeType: true, size: true,
} as const;

export function fileResponseHeaders(file: { filename: string; mimeType: string }, download: boolean) {
  const mimeType = /^[\w.+-]+\/[\w.+-]+$/.test(file.mimeType) ? file.mimeType : "application/octet-stream";
  // Legacy HTML/SVG/unknown files must never execute on the application's origin.
  const attachment = download || !UPLOAD_MIME_TYPES.includes(mimeType);
  const encoded = encodeURIComponent(file.filename.replace(/[\r\n\x00-\x1f\x7f]/g, "")).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return {
    "Content-Type": mimeType,
    "Content-Disposition": `${attachment ? "attachment" : "inline"}; filename="${safeFilename(file.filename)}"; filename*=UTF-8''${encoded}`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "sandbox",
    "Vary": "Cookie",
  };
}
