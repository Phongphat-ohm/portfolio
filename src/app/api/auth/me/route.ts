import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { apiErrorFrom } from "@/lib/api";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return apiErrorFrom(error, "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่ภายหลัง", 503);
  }
}
