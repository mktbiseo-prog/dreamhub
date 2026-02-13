import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow all requests through — auth is checked in server actions/components.
  // When AUTH_SECRET is set, protected pages will redirect via server-side checks.
  // This middleware is a placeholder for future route protection.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
