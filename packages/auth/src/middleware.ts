// ---------------------------------------------------------------------------
// Auth Middleware
//
// Framework-agnostic middleware functions for protecting API routes.
//
// Usage in Next.js App Router:
//   import { authMiddleware, requirePermission } from "@dreamhub/auth";
//
//   export async function GET(req: Request) {
//     const auth = authMiddleware(req);
//     if (!auth.success) {
//       return NextResponse.json({ error: auth.error }, { status: auth.status });
//     }
//
//     const permCheck = requirePermission(auth.user.permissions, Permission.BRAIN_READ);
//     if (!permCheck.success) {
//       return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
//     }
//
//     // auth.user.userId is available here
//   }
// ---------------------------------------------------------------------------

import { Permission } from "@dreamhub/shared-types";
import type { AuthResult, AuthenticatedUser } from "@dreamhub/shared-types";
import { verifyToken } from "./jwt";

/**
 * Extract and verify the Bearer token from a request.
 *
 * Works with any object that has a headers property with an
 * authorization field, or a standard Request/Headers API.
 *
 * @param request - Request object or object with headers.authorization
 * @returns AuthResult — check `.success` before accessing `.user`
 */
export function authMiddleware(
  request: Request | { headers: { authorization?: string } },
): AuthResult {
  let authHeader: string | null = null;

  if (request instanceof Request) {
    authHeader = request.headers.get("authorization");
  } else {
    authHeader = request.headers.authorization ?? null;
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      status: 401,
      error: "Missing or invalid Authorization header. Expected: Bearer <token>",
    };
  }

  const token = authHeader.slice(7); // Remove "Bearer "
  const payload = verifyToken(token);

  if (!payload.isValid) {
    return {
      success: false,
      status: 401,
      error: "Invalid or expired access token",
    };
  }

  const user: AuthenticatedUser = {
    userId: payload.userId,
    permissions: payload.permissions,
  };

  return { success: true, user };
}

/**
 * Check that a user has the required permission.
 *
 * @param userPermissions - The user's permission array (from authMiddleware)
 * @param required - The permission to check
 * @returns Success or failure with 403 status
 */
export function requirePermission(
  userPermissions: Permission[],
  required: Permission,
): { success: true } | { success: false; status: 403; error: string } {
  if (!userPermissions.includes(required)) {
    return {
      success: false,
      status: 403,
      error: `Forbidden: missing required permission "${required}"`,
    };
  }
  return { success: true };
}

/**
 * Check that a user has ALL of the required permissions.
 *
 * @param userPermissions - The user's permission array
 * @param required - Array of permissions that must all be present
 * @returns Success or failure with 403 status
 */
export function requireAllPermissions(
  userPermissions: Permission[],
  required: Permission[],
): { success: true } | { success: false; status: 403; error: string } {
  const missing = required.filter((p) => !userPermissions.includes(p));
  if (missing.length > 0) {
    return {
      success: false,
      status: 403,
      error: `Forbidden: missing required permissions: ${missing.join(", ")}`,
    };
  }
  return { success: true };
}
