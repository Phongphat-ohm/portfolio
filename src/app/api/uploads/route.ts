import { NextResponse, type NextRequest } from "next/server";
import { ensureAdmin, jsonError, unauthorized, maintenanceResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { storageBucket } from "@/lib/storage";
import { detectFileType, MAX_UPLOAD_BYTES, publicFileSelect, safeFilename } from "@/lib/file-policy";
import { FileOwnerType } from "@/generated/prisma/enums";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const maintenance = maintenanceResponse();
  if (maintenance) return maintenance;
  if (!ensureAdmin(request)) {
    return unauthorized();
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (contentLength > MAX_UPLOAD_BYTES + 64 * 1024) return jsonError("File exceeds 10 MiB.", 413);
  const reader = request.body?.getReader();
  if (!reader) return jsonError("A file field is required.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_UPLOAD_BYTES + 64 * 1024) {
      await reader.cancel();
      return jsonError("File exceeds 10 MiB.", 413);
    }
    chunks.push(value);
  }
  let formData: FormData;
  try {
    formData = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
  } catch { return jsonError("Invalid multipart form."); }
  const file = formData.get("file");
  const ownerTypeRaw = String(formData.get("ownerType") || "GENERAL").toUpperCase();
  const ownerType = Object.values(FileOwnerType).includes(ownerTypeRaw as FileOwnerType)
    ? (ownerTypeRaw as FileOwnerType)
    : FileOwnerType.GENERAL;

  if (!(file instanceof File)) {
    return jsonError("A file field is required.");
  }

  if (file.size > MAX_UPLOAD_BYTES) return jsonError("File exceeds 10 MiB.", 413);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectFileType(bytes);
  if (!mimeType || (file.type && file.type !== mimeType)) return jsonError("Unsupported file type or MIME mismatch.", 415);
  const id = crypto.randomUUID();
  const key = `uploads/${id}/${safeFilename(file.name)}`;
  let intent;
  try {
    intent = await prisma.storageCleanupJob.create({ data: { key, nextAttemptAt: new Date(Date.now() + 60 * 60 * 1000) } });
  } catch { return jsonError("Could not prepare upload.", 503); }
  try {
    const { error } = await storageBucket().upload(key, bytes, { contentType: mimeType, upsert: false });
    if (error) throw error;
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.uploadedFile.create({
        data: {
          id,
          ownerType,
          ownerId: formData.get("ownerId") ? String(formData.get("ownerId")) : null,
          filename: file.name,
          key,
          provider: "supabase",
          mimeType,
          size: file.size,
          url: `/api/files/${id}`,
        },
        select: publicFileSelect,
      });
      await tx.storageCleanupJob.delete({ where: { id: intent.id } });
      return created;
    });
    return NextResponse.json({ file: record }, { status: 201 });
  } catch {
    // A lost DB response can hide a successful commit. The worker checks references
    // before deletion rather than blindly removing an object in this catch block.
    console.error(JSON.stringify({ event: "storage_upload_failed", cleanupJobId: intent.id }));
    return jsonError("Could not upload file. Please retry.", 502);
  }
}
