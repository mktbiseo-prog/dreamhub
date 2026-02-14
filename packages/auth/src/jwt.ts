// ---------------------------------------------------------------------------
// JWT Token System
//
// Access tokens (15 min) carry userId + permissions for stateless auth.
// Refresh tokens (7 days) enable silent re-authentication with rotation:
// each refresh invalidates the old refresh token and issues a new pair.
//
// Environment variables:
//   JWT_SECRET         — HMAC secret for access tokens
//   JWT_REFRESH_SECRET — HMAC secret for refresh tokens
//
// In production, these MUST be set to strong random values.
// ---------------------------------------------------------------------------

import { createHmac, randomBytes } from "crypto";
import { Permission } from "@dreamhub/shared-types";
import type { TokenPair, TokenPayload } from "@dreamhub/shared-types";

const ACCESS_TOKEN_TTL = 15 * 60; // 15 minutes in seconds
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecret(): string {
  return process.env.JWT_SECRET || "dreamhub-dev-jwt-secret";
}

function getRefreshSecret(): string {
  return process.env.JWT_REFRESH_SECRET || "dreamhub-dev-jwt-refresh-secret";
}

// ── Base64url helpers ───────────────────────────────────────────────────────

function base64urlEncode(data: string): string {
  return Buffer.from(data, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(encoded: string): string {
  const padded = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

// ── JWT core (minimal, no external deps) ────────────────────────────────────

interface JwtHeader {
  alg: "HS256";
  typ: "JWT";
}

interface AccessTokenClaims {
  sub: string; // userId
  permissions: Permission[];
  iat: number;
  exp: number;
  jti: string; // unique token id
}

interface RefreshTokenClaims {
  sub: string; // userId
  permissions: Permission[];
  type: "refresh";
  iat: number;
  exp: number;
  jti: string;
}

function sign(payload: Record<string, unknown>, secret: string): string {
  const header: JwtHeader = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${headerB64}.${payloadB64}.${signature}`;
}

function verify<T>(token: string, secret: string): T | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;

  // Verify signature
  const expectedSig = createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  if (signatureB64 !== expectedSig) return null;

  // Decode and check expiry
  try {
    const payload = JSON.parse(base64urlDecode(payloadB64)) as T & { exp?: number };
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate an access token (15 min) + refresh token (7 days) pair.
 *
 * @param userId - The Dream ID user's UUID
 * @param permissions - Service permissions to embed in the token
 * @returns Token pair for client storage
 */
export function generateTokens(
  userId: string,
  permissions: Permission[],
): TokenPair {
  const now = Math.floor(Date.now() / 1000);

  const accessClaims: AccessTokenClaims = {
    sub: userId,
    permissions,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL,
    jti: randomBytes(16).toString("hex"),
  };

  const refreshClaims: RefreshTokenClaims = {
    sub: userId,
    permissions,
    type: "refresh",
    iat: now,
    exp: now + REFRESH_TOKEN_TTL,
    jti: randomBytes(16).toString("hex"),
  };

  return {
    accessToken: sign(accessClaims as unknown as Record<string, unknown>, getSecret()),
    refreshToken: sign(refreshClaims as unknown as Record<string, unknown>, getRefreshSecret()),
  };
}

/**
 * Verify an access token and extract its payload.
 *
 * @param token - The JWT access token string
 * @returns Token payload with isValid flag
 */
export function verifyToken(token: string): TokenPayload {
  const claims = verify<AccessTokenClaims>(token, getSecret());

  if (!claims) {
    return { userId: "", permissions: [], isValid: false };
  }

  return {
    userId: claims.sub,
    permissions: claims.permissions,
    isValid: true,
  };
}

/**
 * Exchange a valid refresh token for a new token pair (rotation).
 *
 * The old refresh token should be invalidated by the caller.
 * The new pair contains fresh expiry times.
 *
 * @param refreshToken - The current refresh token
 * @returns New token pair
 * @throws Error if the refresh token is invalid or expired
 */
export function refreshTokens(refreshToken: string): TokenPair {
  const claims = verify<RefreshTokenClaims>(refreshToken, getRefreshSecret());

  if (!claims) {
    throw new Error("Invalid or expired refresh token");
  }

  if (claims.type !== "refresh") {
    throw new Error("Token is not a refresh token");
  }

  return generateTokens(claims.sub, claims.permissions);
}

/**
 * Decode a token without verification (for debugging only).
 * DO NOT use this for authentication — use verifyToken instead.
 */
export function decodeTokenUnsafe(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64urlDecode(parts[1]));
  } catch {
    return null;
  }
}

// Re-export TTL constants for testing
export const TOKEN_TTL = {
  accessTokenSeconds: ACCESS_TOKEN_TTL,
  refreshTokenSeconds: REFRESH_TOKEN_TTL,
} as const;
