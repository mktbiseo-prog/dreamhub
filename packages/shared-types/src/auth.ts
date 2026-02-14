// ---------------------------------------------------------------------------
// Dream ID — Auth Types
//
// Shared across all Dream Hub services. Every user gets one Dream ID
// that grants access to Brain, Planner, Place, Store, and Café.
// ---------------------------------------------------------------------------

// ── Social Providers ────────────────────────────────────────────────────────

/** Supported OAuth social login providers */
export type SocialProvider = "google" | "apple" | "kakao";

// ── Service Permissions ─────────────────────────────────────────────────────

/** Fine-grained permission tokens scoped per service */
export enum Permission {
  // Dream Brain
  BRAIN_READ = "brain:read",
  BRAIN_WRITE = "brain:write",

  // Dream Planner
  PLANNER_READ = "planner:read",
  PLANNER_WRITE = "planner:write",

  // Dream Place
  PLACE_READ = "place:read",
  PLACE_WRITE = "place:write",
  PLACE_MATCH = "place:match",

  // Dream Store
  STORE_READ = "store:read",
  STORE_WRITE = "store:write",
  STORE_SELL = "store:sell",

  // Dream Café
  CAFE_READ = "cafe:read",
  CAFE_CHECKIN = "cafe:checkin",
  CAFE_DOORBELL = "cafe:doorbell",
}

// ── Connected Account ───────────────────────────────────────────────────────

/** A social account linked to a Dream ID */
export interface ConnectedAccount {
  provider: SocialProvider;
  providerAccountId: string;
  email?: string;
  name?: string;
  picture?: string;
  connectedAt: string; // ISO 8601
}

// ── Dream User ──────────────────────────────────────────────────────────────

/** The canonical Dream ID user model */
export interface DreamUser {
  /** UUID v4 */
  id: string;
  /** Unique email address */
  email: string;
  /** Display name */
  name: string;
  /** Profile image URL (optional) */
  profileImageUrl?: string;
  /** Preferred UI language (default: 'en') */
  preferredLanguage: string;
  /** Social accounts linked to this Dream ID */
  connectedAccounts: ConnectedAccount[];
  /** Service-level permissions */
  permissions: Permission[];
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

// ── Social Auth Result ──────────────────────────────────────────────────────

/** Result returned by a social auth provider after successful authentication */
export interface SocialAuthResult {
  userId: string;
  email: string;
  name: string;
  picture?: string;
}

// ── Token Types ─────────────────────────────────────────────────────────────

/** Access + Refresh token pair */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Result of verifying an access token */
export interface TokenPayload {
  userId: string;
  permissions: Permission[];
  isValid: boolean;
}

// ── Middleware Types ─────────────────────────────────────────────────────────

/** User info attached to a request after successful auth */
export interface AuthenticatedUser {
  userId: string;
  permissions: Permission[];
}

/** Successful auth middleware result */
export interface AuthSuccess {
  success: true;
  user: AuthenticatedUser;
}

/** Failed auth middleware result */
export interface AuthFailure {
  success: false;
  status: 401 | 403;
  error: string;
}

/** Union result type for auth middleware */
export type AuthResult = AuthSuccess | AuthFailure;
