import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const where: Prisma.ProjectWhereInput = {};
  if (category && category !== "all") {
    where.categories = { has: category };
  }
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}
