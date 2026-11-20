import { NextResponse, type NextRequest } from "next/server";
import { publicFileSelect } from "@/lib/file-policy";
import { maintenanceResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ensureAdmin, jsonError, parseOptionalDate, parseStringList, unauthorized } from "@/lib/api";

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
  const title = String(body.title ?? "").trim();
  const issuer = String(body.issuer ?? "").trim();

  if (!title || !issuer) {
    return jsonError("Certificate title and issuer are required.");
  }

  const certificate = await prisma.certificate.update({
    where: { id },
    data: {
      title,
      issuer,
      issueDate: parseOptionalDate(body.issueDate),
      credentialId: body.credentialId ? String(body.credentialId) : null,
      credentialUrl: body.credentialUrl ? String(body.credentialUrl) : null,
      description: body.description ? String(body.description) : null,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      fileId: body.fileId ? String(body.fileId) : null,
      tags: parseStringList(body.tags),
      published: body.published !== false,
      sortOrder: Number(body.sortOrder || 0),
    },
    include: { file: { select: publicFileSelect } },
  });

  return NextResponse.json({ certificate });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const maintenance = maintenanceResponse();
  if (maintenance) return maintenance;
  if (!await ensureAdmin(request)) {
    return unauthorized();
  }

  const { id } = await context.params;
  await prisma.certificate.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
