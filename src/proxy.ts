import { NextResponse, type NextRequest } from "next/server";

// Standalone: deploy this file alone to the legacy release before freezing source
// writes. It deliberately does not import the new Database or Storage integration.
export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_READ_ONLY === "true" &&
      !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
      request.nextUrl.pathname !== "/api/auth/logout") {
    return NextResponse.json({ error: "Maintenance: writes are temporarily disabled." }, {
      status: 503, headers: { "Retry-After": "300", "Cache-Control": "no-store" },
    });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
