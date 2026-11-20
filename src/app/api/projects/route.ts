import { NextResponse, type NextRequest } from "next/server";
import { publicFileSelect } from "@/lib/file-policy";
import { maintenanceResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ensureAdmin, jsonError, parseOptionalDate, parseStringList, slugify, unauthorized } from "@/lib/api";

export async function GET(request: NextRequest) {
  const session = ensureAdmin(request);
  const showAll = request.nextUrl.searchParams.get("all") === "true" && !!session;
  const projects = await prisma.project.findMany({
    where: showAll ? undefined : { published: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    include: { file: { select: publicFileSelect } },
  });

  return NextResponse.json({ projects }, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}

export async function POST(request: NextRequest) {
  const maintenance = maintenanceResponse();
  if (maintenance) return maintenance;
  if (!ensureAdmin(request)) {
    return unauthorized();
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const summary = String(body.summary ?? "").trim();

  if (!title || !summary) {
    return jsonError("Project title and summary are required.");
  }

  const project = await prisma.project.create({
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

  return NextResponse.json({ project }, { status: 201 });
}
