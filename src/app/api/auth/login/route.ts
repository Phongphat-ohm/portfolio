import { signToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { setSessionCookie, validateLogin } from "@/lib/auth";
import { maintenanceResponse, jsonError } from "@/lib/api";

export async function POST(request: Request) {
  const maintenance = maintenanceResponse();
  if (maintenance) return maintenance;
  const body = (await request.json()) as { username?: string; password?: string };
  const username = body.username?.trim();
  const password = body.password ?? "";

  if (!username || !password) {
    return jsonError("Username and password are required.");
  }

  const admin = await validateLogin(username, password);

  if (!admin) {
    return jsonError("Invalid username or password.", 401);
  }

  await setSessionCookie({
    sub: admin.id,
    username: admin.username,
    role: admin.role,
  });

  const response = NextResponse.json({ ok: true, username: admin.username, user: admin }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set("token", await signToken({ userId: admin.id, role: admin.role }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" });
  return response;
}
