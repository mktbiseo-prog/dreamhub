import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/stories/create", "/dashboard", "/my-dreams"];

function isProtectedPath(pathname: string): boolean {
  if (protectedPaths.some((p) => pathname.startsWith(p))) return true;
  if (/^\/stories\/[^/]+\/products\/create/.test(pathname)) return true;
  if (/^\/stories\/[^/]+\/edit/.test(pathname)) return true;
  if (/^\/stories\/[^/]+\/products\/[^/]+\/edit/.test(pathname)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // next-auth v5 session cookie
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ??
    request.cookies.get("authjs.session-token")?.value;
  // Demo session cookie (set by mock sign-in page)
  const demoSession = request.cookies.get("dreamhub-demo-session")?.value;

  if (!sessionToken && !demoSession) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/stories/create",
    "/stories/:storyId/edit",
    "/stories/:storyId/products/create",
    "/stories/:storyId/products/:productId/edit",
    "/dashboard",
    "/my-dreams",
  ],
};
