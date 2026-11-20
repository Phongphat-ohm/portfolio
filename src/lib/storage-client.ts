import { createClient } from "@supabase/supabase-js";

// Also used by migration scripts; application imports must go through storage.ts.
export function storageConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase Storage configuration is incomplete.");
  return { url: url.replace(/\/+$/, ""), key, bucket: process.env.SUPABASE_STORAGE_BUCKET || "portfolio-files" };
}

export function createStorageClient() {
  const { url, key } = storageConfig();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

export function storageBucket() {
  return createStorageClient().storage.from(storageConfig().bucket);
}

export async function downloadStorageObject(key: string) {
  const { data, error } = await storageBucket().download(key, {}, {
    cache: "no-store", signal: AbortSignal.timeout(120_000),
  }).asStream();
  if (error || !data) throw new Error("Storage download failed.");
  return { body: data };
}
