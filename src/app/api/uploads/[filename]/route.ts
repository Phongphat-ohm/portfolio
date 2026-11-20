import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GET as getFile } from "@/app/api/files/[id]/route";
export async function GET(request: NextRequest, context: { params: Promise<{ filename: string }> }) {
 const { filename } = await context.params;
 if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(filename)) return NextResponse.json({error:"Not found"},{status:404});
 const file = await prisma.uploadedFile.findFirst({ where: { url: request.nextUrl.pathname } });
 if (!file) return NextResponse.json({error:"Not found"},{status:404});
 return getFile(request, { params: Promise.resolve({id:file.id}) });
}
export async function DELETE() { return NextResponse.json({error:"Detach the image from the project; shared objects are retained."},{status:409}); }
