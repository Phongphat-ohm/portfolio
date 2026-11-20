import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ error: "Direct uploads are disabled. Use /api/uploads (images or PDF, maximum 10 MiB)." }, { status: 410 }); }
