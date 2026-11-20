import { NextResponse, type NextRequest } from "next/server";
import { publicFileSelect } from "@/lib/file-policy";
import { maintenanceResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ensureAdmin, jsonError, parseOptionalDate, parseStringList, unauthorized } from "@/lib/api";

export async function GET(request: NextRequest) {
  const session = ensureAdmin(request);
  const showAll = request.nextUrl.searchParams.get("all") === "true" && !!session;
  const certificates = await prisma.certificate.findMany({
    where: showAll ? undefined : { published: true },
    orderBy: [{ sortOrder: "asc" }, { issueDate: "desc" }, { createdAt: "desc" }],
    include: { file: { select: publicFileSelect } },
  });

  return NextResponse.json({ certificates }, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}

export async function POST(request: NextRequest) {
  const maintenance = maintenanceResponse();
  if (maintenance) return maintenance;
  if (!ensureAdmin(request)) {
    return unauthorized();
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const issuer = String(body.issuer ?? "").trim();

  if (!title || !issuer) {
    return jsonError("Certificate title and issuer are required.");
  }

  const certificate = await prisma.certificate.create({
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

  return NextResponse.json({ certificate }, { status: 201 });
}
