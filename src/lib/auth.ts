import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "portfolio_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  username: string;
  role: string;
  exp: number;
};

function getAuthSecret() {
  if (process.env.NODE_ENV === "production" && (!process.env.AUTH_SECRET || process.env.AUTH_SECRET === "development-only-change-me")) {
    throw new Error("A production AUTH_SECRET is required.");
  }
  return process.env.AUTH_SECRET || "development-only-change-me";
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("base64url");

  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  if (/^\$2[aby]\$/.test(storedHash)) { try { return bcrypt.compareSync(password, storedHash); } catch { return false; } }
  const [algorithm, iterationsRaw, salt, originalHash] = storedHash.split("$");

  if (algorithm !== "pbkdf2_sha256" || !iterationsRaw || !salt || !originalHash) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isSafeInteger(iterations) || iterations < 1 || iterations > 1_000_000) return false;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("base64url");

  return Buffer.byteLength(hash) === Buffer.byteLength(originalHash) && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const body: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = base64Url(JSON.stringify(body));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function readSessionToken(token?: string | null): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature, extra] = token.split(".");

  if (extra !== undefined || !encodedPayload || !signature) {
    return null;
  }
  const expected = sign(encodedPayload);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected) || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;

    if (!Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000) || typeof payload.sub !== "string" || typeof payload.username !== "string" || typeof payload.role !== "string") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: Omit<SessionPayload, "exp">) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(payload), {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function getRequestSession(request: NextRequest) {
  return readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(request: NextRequest) {
  const session = getRequestSession(request);

  if (session?.role === "admin") return session;
  const user = await userFromJwt(request.cookies.get("token")?.value);
  return user ? { sub: user.id, username: user.username, role: user.role, exp: 0 } : null;
}

export async function validateLogin(username: string, password: string) {
  const current = await prisma.user.findUnique({ where: { username } });
  if (current) {
    return current.role === "admin" && verifyPassword(password, current.passwordHash)
      ? { id: current.id, username: current.username, role: current.role } : null;
  }
  const admin = await prisma.adminUser.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
  });

  if (admin) {
    return verifyPassword(password, admin.passwordHash)
      ? { id: admin.id, username: admin.username, role: admin.role } : null;
  }

  if (
    process.env.ADMIN_USERNAME &&
    process.env.ADMIN_PASSWORD &&
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return { id: "env-admin", username, role: "admin" };
  }

  return null;
}

async function userFromJwt(token?: string) {
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, username: true, role: true } });
}

export async function getAuthUser() {
  const jar = await cookies();
  const session = readSessionToken(jar.get("portfolio_session")?.value);
  if (session?.role === "admin") return { id: session.sub, username: session.username, role: "admin" as const };
  return userFromJwt(jar.get("token")?.value);
}
