import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { isS3Configured, MAX_UPLOAD_SIZE, getPublicUrl, putObject } from "@/lib/s3";
import { ALLOWED_IMAGE_TYPES, deleteImage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return apiError("Unauthorized", 401);
  }

  if (!isS3Configured()) {
    return apiError("S3 is not configured", 500);
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return apiError("file is required (FormData field 'file')", 400);
  }
  if (file.size === 0) {
    return apiError("file is empty", 400);
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return apiError(`File size must not exceed ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`, 400);
  }
  if (!(file.type in ALLOWED_IMAGE_TYPES)) {
    return apiError("Unsupported content type (png/jpg/webp/gif/svg)", 400);
  }

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  const key = `uploads/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await putObject(key, buffer, file.type);
  } catch (error) {
    console.warn("[api][uploads] S3 put failed:", error);
    return apiError("Failed to upload file to storage", 502);
  }

  return NextResponse.json({ url: getPublicUrl(key), method: "api" });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const url = typeof body === "object" && body !== null ? (body as { url?: unknown }).url : undefined;
  if (typeof url !== "string" || !url.trim()) {
    return apiError("url is required", 400);
  }

  await deleteImage(url);

  return NextResponse.json({ ok: true });
}
