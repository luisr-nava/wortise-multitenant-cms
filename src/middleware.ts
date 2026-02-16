import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 600 * 1000,
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate Limiting ONLY for Auth Routes
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    // 10 requests per minute per IP for auth routes
    const { isRateLimited } = limiter.check(10, ip);

    if (isRateLimited) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }

    // Do NOT protect /login or /register
    return NextResponse.next();
  }

  // Dashboard Protection - ONLY for dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const session =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session_token");

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      // Append ?from=currentPath
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match ONLY these paths to ensure strict control.
     * - /dashboard/* : Protected by session
     * - /login, /register : Public but rate-limited
     *
     * Everything else (including /api/trpc, /api/auth, /) is ignored by middleware.
     */
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};

