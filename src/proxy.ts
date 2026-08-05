import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const session = token ? await verifyToken(token) : null;

  if (pathname.startsWith("/dashboard") && pathname !== "/dashboard") {
    if (!session) {
      const url = new URL("/dashboard", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/admin") ||
    (pathname.startsWith("/api/uploads") &&
      (request.method === "POST" || request.method === "DELETE"))
  ) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/uploads",
    "/api/uploads/:path*",
  ],
};
