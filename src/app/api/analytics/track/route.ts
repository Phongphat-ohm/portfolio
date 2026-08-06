import { NextRequest, NextResponse } from "next/server";
import {
  getTodayCount,
  getTotalCount,
  isBot,
  trackUniqueVisit,
} from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) {
    return NextResponse.json({ counted: false, today: 0, total: 0 });
  }

  const existing = request.cookies.get("visitor_id")?.value;
  const visitorId =
    existing && existing.length >= 8 && existing.length <= 200
      ? existing
      : crypto.randomUUID();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  await trackUniqueVisit(visitorId, ip);
  const [today, total] = await Promise.all([getTodayCount(), getTotalCount()]);

  const response = NextResponse.json({ counted: true, today, total });
  if (!existing) {
    response.cookies.set("visitor_id", visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}
