import { NextResponse } from "next/server";
import { getTodayCount, getTotalCount } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [today, total] = await Promise.all([getTodayCount(), getTotalCount()]);
  return NextResponse.json({ today, total });
}
