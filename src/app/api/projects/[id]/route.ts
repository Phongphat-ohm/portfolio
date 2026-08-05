import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    return apiError("Project not found", 404);
  }

  return NextResponse.json({ project });
}
