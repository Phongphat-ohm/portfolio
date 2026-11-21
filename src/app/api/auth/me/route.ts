import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);

  return NextResponse.json({ user: session }, { status: session ? 200 : 401, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}
