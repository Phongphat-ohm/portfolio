import "server-only";
export { storageBucket, downloadStorageObject } from "./storage-client";

export function isValidImageFilename(filename: string) {
  return filename.length > 0 && filename.length <= 255 && !filename.includes("..") && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(filename);
}

export async function deleteImage(_reference: string | null | undefined) { /* Assets may be shared. Do not eagerly delete. */ }
