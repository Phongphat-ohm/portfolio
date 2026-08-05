import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiErrorFrom } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return apiError("Project not found", 404);
    }

    return NextResponse.json({ project });
  } catch (error) {
    return apiErrorFrom(error, "ไม่สามารถโหลดข้อมูลโปรเจกต์ได้ กรุณาลองใหม่ภายหลัง", 500);
  }
}
