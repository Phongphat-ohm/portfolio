import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();

  const response = NextResponse.json({ ok: true });
  response.cookies.set("token", "", { maxAge: 0, path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return response;
}
