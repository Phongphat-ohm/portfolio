import { NextRequest, NextResponse } from "next/server";
import { apiError, apiErrorFrom } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { deleteImage, readImage } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const image = await readImage(filename);
    if (!image) {
      return apiError("Not found", 404);
    }
    return new NextResponse(new Uint8Array(image.buffer), {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return apiErrorFrom(error, "Failed to read image", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { filename } = await context.params;
    await deleteImage(filename);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorFrom(error, "Failed to delete image", 500);
  }
}
