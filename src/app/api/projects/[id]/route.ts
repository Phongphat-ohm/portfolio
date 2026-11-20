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
  if (!ensureAdmin(request)) {
    return unauthorized();
  }

  const { id } = await context.params;
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const summary = String(body.summary ?? "").trim();

  if (!title || !summary) {
    return jsonError("Project title and summary are required.");
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      title,
      slug: String(body.slug || slugify(title)),
      summary,
      description: body.description ? String(body.description) : null,
      stack: parseStringList(body.stack),
      repoUrl: body.repoUrl ? String(body.repoUrl) : null,
      liveUrl: body.liveUrl ? String(body.liveUrl) : null,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      fileId: body.fileId ? String(body.fileId) : null,
      startDate: parseOptionalDate(body.startDate),
      endDate: parseOptionalDate(body.endDate),
      featured: Boolean(body.featured),
      published: body.published !== false,
      sortOrder: Number(body.sortOrder || 0),
    },
    include: { file: { select: publicFileSelect } },
  });

  return NextResponse.json({ project });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const maintenance = maintenanceResponse();
  if (maintenance) return maintenance;
  if (!ensureAdmin(request)) {
    return unauthorized();
  }

  const { id } = await context.params;
  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
