import { projectForClient, projectInput } from "@/lib/projects";
import { NextResponse, type NextRequest } from "next/server";
import { publicFileSelect } from "@/lib/file-policy";
import { maintenanceResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ensureAdmin, jsonError, parseOptionalDate, parseStringList, slugify, unauthorized } from "@/lib/api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const maintenance = maintenanceResponse();
  if (maintenance) return maintenance;
  if (!await ensureAdmin(request)) {
    return unauthorized();
  }

  const { id } = await context.params;
  const body = await request.json();
  const data = projectInput(body);
  if (!data.name || !data.summary) return jsonError("Project name and description are required.");

  const project = await prisma.project.update({
    where: { id },
    data,
    include: { file: { select: publicFileSelect } },
  });

  return NextResponse.json({ project: projectForClient(project) });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const maintenance = maintenanceResponse();
  if (maintenance) return maintenance;
  if (!await ensureAdmin(request)) {
    return unauthorized();
  }

  const { id } = await context.params;
  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const project = await prisma.project.findFirst({ where: { id, ...(!await ensureAdmin(request) ? { published: true } : {}) }, include: { file: { select: publicFileSelect } } });
  if (!project) return jsonError("Project not found", 404);
  return NextResponse.json({ project: projectForClient(project) }, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}
