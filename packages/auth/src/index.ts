// ---------------------------------------------------------------------------
// @dreamhub/auth — Public API
//
// Dream ID authentication system for all Dream Hub services.
// ---------------------------------------------------------------------------

// ── NextAuth (existing) ─────────────────────────────────────────────────────

import NextAuth from "next-auth";
import { authConfig } from "./config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

export { authConfig } from "./config";

// ── Types (re-exported from shared-types) ───────────────────────────────────

export {
  Permission,
  type SocialProvider,
  type ConnectedAccount,
  type DreamUser,
  type SocialAuthResult,
  type TokenPair,
  type TokenPayload,
  type AuthenticatedUser,
  type AuthSuccess,
  type AuthFailure,
  type AuthResult,
} from "@dreamhub/shared-types";

// ── Permissions ─────────────────────────────────────────────────────────────

export {
  DEFAULT_PERMISSIONS,
  ALL_PERMISSIONS,
  PERMISSION_GROUPS,
  hasPermission,
  hasAllPermissions,
} from "./permissions";

// ── Social Auth Providers ───────────────────────────────────────────────────

export type { SocialAuthProvider } from "./social-providers";

export {
  MockGoogleProvider,
  MockAppleProvider,
  MockKakaoProvider,
  createSocialProvider,
  getAllProviders,
} from "./social-providers";

// ── JWT Token System ────────────────────────────────────────────────────────

export {
  generateTokens,
  verifyToken,
  refreshTokens,
  decodeTokenUnsafe,
  TOKEN_TTL,
} from "./jwt";

// ── Middleware ───────────────────────────────────────────────────────────────

export {
  authMiddleware,
  requirePermission,
  requireAllPermissions,
} from "./middleware";

// ── User Store ──────────────────────────────────────────────────────────────

export { UserStore, userStore } from "./user-store";

// ── Auth Handlers ───────────────────────────────────────────────────────────

export { AuthHandlers, authHandlers } from "./handlers";
export type { HandlerResponse } from "./handlers";

// ── SSO Manager ─────────────────────────────────────────────────────────────

export { SSOManager } from "./sso";
export type {
  ServiceInitRecords,
  SSORegistrationResult,
  SSOSocialLoginResult,
  SSOUpdateResult,
  SSODeletionResult,
} from "./sso";
