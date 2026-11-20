import { projectForClient, projectInput } from "@/lib/projects";
import { NextResponse, type NextRequest } from "next/server";
import { publicFileSelect } from "@/lib/file-policy";
import { maintenanceResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ensureAdmin, jsonError, parseOptionalDate, parseStringList, slugify, unauthorized } from "@/lib/api";

export async function GET(request: NextRequest) {
  const session = await ensureAdmin(request);
  const showAll = request.nextUrl.searchParams.get("all") === "true" && !!session;
  const category = request.nextUrl.searchParams.get("category");
  const search = request.nextUrl.searchParams.get("search");
  const projects = await prisma.project.findMany({
    where: { ...(showAll ? {} : { published: true }), ...(category && category !== "all" ? { categories: { has: category } } : {}), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    include: { file: { select: publicFileSelect } },
  });

  return NextResponse.json({ projects: projects.map(projectForClient) }, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}

export async function POST(request: NextRequest) {
  const maintenance = maintenanceResponse();
  if (maintenance) return maintenance;
  if (!await ensureAdmin(request)) {
    return unauthorized();
  }

  const body = await request.json();
  const data = projectInput(body);
  if (!data.name || !data.summary) return jsonError("Project name and description are required.");

  const project = await prisma.project.create({
    data,
    include: { file: { select: publicFileSelect } },
  });

  return NextResponse.json({ project: projectForClient(project) }, { status: 201 });
}
