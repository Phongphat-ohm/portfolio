import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { downloadStorageObject } from "@/lib/storage";
import { fileResponseHeaders, publicationReference } from "@/lib/file-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const notFound = () => NextResponse.json({ error: "File not found" }, { status: 404, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const file = await prisma.uploadedFile.findUnique({ where: { id } });
  if (!file) return notFound();
  if (!await requireAdmin(request)) {
    const where = publicationReference(id);
    const [project, certificate] = await Promise.all([
      prisma.project.findFirst({ where: publicationReference(id, "image"), select: { id: true } }),
      prisma.certificate.findFirst({ where, select: { id: true } }),
    ]);
    if (!project && !certificate) return notFound();
  }
  if (file.provider !== "supabase") return NextResponse.json({ error: "File migration incomplete" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const response = await downloadStorageObject(file.key);
    return new Response(response.body, { headers: fileResponseHeaders(file, request.nextUrl.searchParams.get("download") === "true") });
  } catch {
    return NextResponse.json({ error: "Could not load file" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
