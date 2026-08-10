import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiErrorFrom, requiredString, parseStringArray } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import { deleteImage } from "@/lib/storage";
import type { ProjectStatus } from "@/generated/prisma/enums";

const STATUS_VALUES = ["completed", "in_progress"] as const;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await context.params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Project not found", 404);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return apiError("Invalid body", 400);
    }

    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (!requiredString(body.name)) return apiError("name must be a non-empty string", 400);
      data.name = body.name.trim();
    }
    if (body.description !== undefined) {
      if (!requiredString(body.description)) return apiError("description must be a non-empty string", 400);
      data.description = body.description.trim();
    }
    if (body.year !== undefined) {
      if (typeof body.year !== "string" || !body.year.trim()) return apiError("year must be a non-empty string", 400);
      data.year = body.year.trim();
    }
    if (body.status !== undefined) {
      const status = body.status as ProjectStatus;
      if (!STATUS_VALUES.includes(status)) return apiError("Invalid status", 400);
      data.status = status;
    }
    for (const field of ["tags", "categories"] as const) {
      if (body[field] !== undefined) {
        const values = parseStringArray(body[field]);
        if (values === null) return apiError(`${field} must be a string array`, 400);
        data[field] = values;
      }
    }
    for (const field of ["image", "github", "demo"] as const) {
      if (body[field] !== undefined) {
        if (body[field] !== null && typeof body[field] !== "string") {
          return apiError(`${field} must be a string or null`, 400);
        }
        data[field] = body[field] || null;
      }
    }

    const oldImage = existing.image;
    const project = await prisma.project.update({
      where: { id },
      data,
    });

    if (body.image !== undefined && oldImage && oldImage !== data.image) {
      await deleteImage(oldImage);
    }

    return NextResponse.json({ project });
  } catch (error) {
    return apiErrorFrom(error, "ไม่สามารถแก้ไขโปรเจกต์ได้ กรุณาลองใหม่ภายหลัง", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await context.params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Project not found", 404);
    }

    if (existing.image) {
      await deleteImage(existing.image);
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorFrom(error, "ไม่สามารถลบโปรเจกต์ได้ กรุณาลองใหม่ภายหลัง", 500);
  }
}
