import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import {
  isS3Configured,
  MAX_UPLOAD_SIZE,
  PRESIGN_EXPIRES,
  getPublicUrl,
  presignedPutUrl,
} from "@/lib/s3";
import { ALLOWED_IMAGE_TYPES } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return apiError("Unauthorized", 401);
  }

  if (!isS3Configured()) {
    return apiError("S3 is not configured", 500);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return apiError("Invalid body", 400);
  }

  const { filename, contentType, size } = body as {
    filename?: unknown;
    contentType?: unknown;
    size?: unknown;
  };

  if (typeof filename !== "string" || !filename.trim() || filename.length > 255) {
    return apiError("filename is required (1-255 chars)", 400);
  }
  if (typeof contentType !== "string" || !(contentType in ALLOWED_IMAGE_TYPES)) {
    return apiError("Unsupported content type (png/jpg/webp/gif/svg)", 400);
  }
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
    return apiError("size must be a positive number", 400);
  }
  if (size > MAX_UPLOAD_SIZE) {
    return apiError(`File size must not exceed ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`, 400);
  }

  const ext = ALLOWED_IMAGE_TYPES[contentType];
  const key = `uploads/${randomUUID()}.${ext}`;

  try {
    const presignedUrl = await presignedPutUrl(key, contentType);
    return NextResponse.json({
      presignedUrl,
      key,
      url: getPublicUrl(key),
      expiresIn: PRESIGN_EXPIRES,
    });
  } catch (error) {
    console.warn("[api][uploads] presign failed:", error);
    return apiError("Failed to create upload link", 500);
  }
}
