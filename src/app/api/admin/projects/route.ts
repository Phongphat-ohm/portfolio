import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiErrorFrom, requiredString, parseStringArray } from "@/lib/api";
import { getAuthUser } from "@/lib/auth";
import type { ProjectStatus } from "@/generated/prisma/enums";

const STATUS_VALUES = ["completed", "in_progress"] as const;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return apiError("Invalid body", 400);
    }

    if (!requiredString(body.name) || !requiredString(body.description)) {
      return apiError("name and description are required", 400);
    }

    const status = (body.status ?? "completed") as ProjectStatus;
    if (!STATUS_VALUES.includes(status)) {
      return apiError("Invalid status", 400);
    }

    const tags = parseStringArray(body.tags);
    const categories = parseStringArray(body.categories);
    if (tags === null || categories === null) {
      return apiError("tags and categories must be string arrays", 400);
    }

    const year =
      typeof body.year === "string" && body.year.trim()
        ? body.year.trim()
        : String(new Date().getFullYear());

    const image = typeof body.image === "string" && body.image ? body.image : null;
    const github = typeof body.github === "string" && body.github ? body.github : null;
    const demo = typeof body.demo === "string" && body.demo ? body.demo : null;

    const project = await prisma.project.create({
      data: {
        name: body.name.trim(),
        description: body.description.trim(),
        image,
        tags,
        categories,
        year,
        status,
        github,
        demo,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return apiErrorFrom(error, "ไม่สามารถบันทึกโปรเจกต์ได้ กรุณาลองใหม่ภายหลัง", 500);
  }
}
