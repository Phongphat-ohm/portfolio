import { SignJWT, jwtVerify } from "jose";

function secret() {
  const value = process.env.JWT_SECRET || process.env.AUTH_SECRET;
  if (!value) throw new Error("JWT_SECRET is required");
  return new TextEncoder().encode(value);
}

export interface SessionPayload {
  userId: string;
  role: string;
}

export async function signToken(payload: SessionPayload) {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return {
      userId: payload.userId as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}
