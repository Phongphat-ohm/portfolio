import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { saveImage, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return apiError("file is required (FormData field 'file')", 400);
  }
  if (file.size === 0) {
    return apiError("file is empty", 400);
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return apiError("File size must not exceed 5MB", 400);
  }
  if (!(file.type in ALLOWED_IMAGE_TYPES)) {
    return apiError("Unsupported content type (png/jpg/webp/gif/svg)", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = await saveImage(buffer, file.type).catch(() => null);
  if (!filename) {
    return apiError("Failed to save file", 500);
  }

  return NextResponse.json({ filename });
}
