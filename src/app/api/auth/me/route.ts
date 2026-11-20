import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);

  return NextResponse.json({ user: session }, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}
