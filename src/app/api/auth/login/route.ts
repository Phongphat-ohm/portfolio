import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { apiError } from "@/lib/api";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = body?.username;
  const password = body?.password;

  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return apiError("Username and password are required", 400);
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return apiError("Invalid username or password", 401);
  }

  const token = await signToken({ userId: user.id, role: user.role });

  const response = NextResponse.json({ ok: true, username: user.username });
  response.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
