import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/onboarding",
  "/discover",
  "/matches",
  "/messages",
  "/profile",
  "/cafe",
  "/dashboard",
  "/teams",
  "/projects",
  "/trials",
  "/globe",
  "/explore",
];

// Routes that are always public
const PUBLIC_ROUTES = ["/", "/auth", "/api/auth", "/api/cafe", "/doorbell-display"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip if no DATABASE_URL (mock mode — no auth enforcement)
  if (!process.env.DATABASE_URL) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected) {
    // next-auth v5 stores session in a cookie
    const sessionToken =
      request.cookies.get("__Secure-authjs.session-token")?.value ??
      request.cookies.get("authjs.session-token")?.value;
    // Also accept demo session cookie (set by the mock sign-in page)
    const demoSession = request.cookies.get("dreamhub-demo-session")?.value;

    if (!sessionToken && !demoSession) {
      const signInUrl = new URL("/auth/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and _next
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
