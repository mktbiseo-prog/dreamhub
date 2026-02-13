import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/stories/create", "/dashboard", "/my-dreams"];

function isProtectedPath(pathname: string): boolean {
  if (protectedPaths.some((p) => pathname.startsWith(p))) return true;
  // /stories/*/products/create
  if (/^\/stories\/[^/]+\/products\/create/.test(pathname)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Check for NextAuth session token
  const token =
    request.cookies.get("next-auth.session-token") ??
    request.cookies.get("__Secure-next-auth.session-token");

  if (!token) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/stories/create", "/stories/:storyId/products/create", "/dashboard", "/my-dreams"],
};
