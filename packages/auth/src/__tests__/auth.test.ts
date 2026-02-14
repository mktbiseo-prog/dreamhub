// ---------------------------------------------------------------------------
// Dream ID Auth — Unit Tests
//
// Tests cover:
//   1. JWT token generation & verification
//   2. Expired token rejection
//   3. Refresh token rotation
//   4. Permission checks (403)
//   5. Auth middleware (401)
//   6. Social auth providers (mock)
//   7. Default permissions on signup
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll } from "vitest";
import { Permission } from "@dreamhub/shared-types";
import { generateTokens, verifyToken, refreshTokens, decodeTokenUnsafe, TOKEN_TTL } from "../jwt";
import { DEFAULT_PERMISSIONS, ALL_PERMISSIONS, PERMISSION_GROUPS, hasPermission, hasAllPermissions } from "../permissions";
import { authMiddleware, requirePermission, requireAllPermissions } from "../middleware";
import {
  MockGoogleProvider,
  MockAppleProvider,
  MockKakaoProvider,
  createSocialProvider,
  getAllProviders,
} from "../social-providers";
import { createHmac } from "crypto";

// ═══════════════════════════════════════════════════════════════════════════
// 1. JWT Token Generation & Verification
// ═══════════════════════════════════════════════════════════════════════════

describe("JWT Token System", () => {
  const userId = "user-550e8400-e29b-41d4-a716-446655440000";
  const permissions = [Permission.BRAIN_READ, Permission.BRAIN_WRITE, Permission.PLACE_READ];

  it("should generate an access + refresh token pair", () => {
    const tokens = generateTokens(userId, permissions);

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.accessToken).not.toBe(tokens.refreshToken);

    // Both should be valid JWT format (3 base64url segments)
    expect(tokens.accessToken.split(".")).toHaveLength(3);
    expect(tokens.refreshToken.split(".")).toHaveLength(3);
  });

  it("should verify a valid access token and return payload", () => {
    const tokens = generateTokens(userId, permissions);
    const payload = verifyToken(tokens.accessToken);

    expect(payload.isValid).toBe(true);
    expect(payload.userId).toBe(userId);
    expect(payload.permissions).toEqual(permissions);
  });

  it("should reject an invalid token (bad signature)", () => {
    const tokens = generateTokens(userId, permissions);
    // Tamper with the token
    const tampered = tokens.accessToken.slice(0, -5) + "XXXXX";
    const payload = verifyToken(tampered);

    expect(payload.isValid).toBe(false);
    expect(payload.userId).toBe("");
    expect(payload.permissions).toEqual([]);
  });

  it("should reject a malformed token", () => {
    expect(verifyToken("not-a-jwt").isValid).toBe(false);
    expect(verifyToken("").isValid).toBe(false);
    expect(verifyToken("a.b").isValid).toBe(false);
  });

  it("should reject an expired access token", () => {
    // Manually create an already-expired token
    const secret = process.env.JWT_SECRET || "dreamhub-dev-jwt-secret";
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8")
      .toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const payload = {
      sub: userId,
      permissions,
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) - 60, // expired 60 seconds ago
      jti: "test-expired-jti",
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8")
      .toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const sig = createHmac("sha256", secret)
      .update(`${header}.${payloadB64}`)
      .digest("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const expiredToken = `${header}.${payloadB64}.${sig}`;
    const result = verifyToken(expiredToken);

    expect(result.isValid).toBe(false);
  });

  it("should generate unique tokens on each call (jti)", () => {
    const tokens1 = generateTokens(userId, permissions);
    const tokens2 = generateTokens(userId, permissions);

    expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
    expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
  });

  it("should decode token payload without verification (unsafe)", () => {
    const tokens = generateTokens(userId, permissions);
    const decoded = decodeTokenUnsafe(tokens.accessToken);

    expect(decoded).not.toBeNull();
    expect(decoded!.sub).toBe(userId);
    expect(decoded!.permissions).toEqual(permissions);
    expect(decoded!.exp).toBeDefined();
    expect(decoded!.iat).toBeDefined();
    expect(decoded!.jti).toBeDefined();
  });

  it("should have correct TTL constants", () => {
    expect(TOKEN_TTL.accessTokenSeconds).toBe(15 * 60); // 15 minutes
    expect(TOKEN_TTL.refreshTokenSeconds).toBe(7 * 24 * 60 * 60); // 7 days
  });

  it("should embed correct expiry in access token", () => {
    const tokens = generateTokens(userId, permissions);
    const decoded = decodeTokenUnsafe(tokens.accessToken);
    const iat = decoded!.iat as number;
    const exp = decoded!.exp as number;

    expect(exp - iat).toBe(TOKEN_TTL.accessTokenSeconds);
  });

  it("should embed correct expiry in refresh token", () => {
    const tokens = generateTokens(userId, permissions);
    const decoded = decodeTokenUnsafe(tokens.refreshToken);
    const iat = decoded!.iat as number;
    const exp = decoded!.exp as number;

    expect(exp - iat).toBe(TOKEN_TTL.refreshTokenSeconds);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Refresh Token Rotation
// ═══════════════════════════════════════════════════════════════════════════

describe("Refresh Token Rotation", () => {
  const userId = "user-refresh-test";
  const permissions = [Permission.BRAIN_READ, Permission.STORE_WRITE];

  it("should issue new tokens from a valid refresh token", () => {
    const original = generateTokens(userId, permissions);
    const rotated = refreshTokens(original.refreshToken);

    // New pair should be different
    expect(rotated.accessToken).not.toBe(original.accessToken);
    expect(rotated.refreshToken).not.toBe(original.refreshToken);

    // New access token should be valid
    const payload = verifyToken(rotated.accessToken);
    expect(payload.isValid).toBe(true);
    expect(payload.userId).toBe(userId);
    expect(payload.permissions).toEqual(permissions);
  });

  it("should reject an expired refresh token", () => {
    const secret = process.env.JWT_REFRESH_SECRET || "dreamhub-dev-jwt-refresh-secret";
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8")
      .toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const payload = {
      sub: userId,
      permissions,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000) - 86400,
      exp: Math.floor(Date.now() / 1000) - 60,
      jti: "expired-refresh",
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8")
      .toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const sig = createHmac("sha256", secret)
      .update(`${header}.${payloadB64}`)
      .digest("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const expiredRefresh = `${header}.${payloadB64}.${sig}`;

    expect(() => refreshTokens(expiredRefresh)).toThrow("Invalid or expired refresh token");
  });

  it("should reject an access token used as refresh token", () => {
    const tokens = generateTokens(userId, permissions);
    // Access token uses JWT_SECRET, not JWT_REFRESH_SECRET
    expect(() => refreshTokens(tokens.accessToken)).toThrow();
  });

  it("should preserve permissions through rotation", () => {
    const fullPerms = [
      Permission.BRAIN_READ, Permission.BRAIN_WRITE,
      Permission.PLACE_READ, Permission.PLACE_WRITE, Permission.PLACE_MATCH,
    ];
    const original = generateTokens(userId, fullPerms);
    const rotated = refreshTokens(original.refreshToken);
    const payload = verifyToken(rotated.accessToken);

    expect(payload.permissions).toEqual(fullPerms);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Permissions
// ═══════════════════════════════════════════════════════════════════════════

describe("Permissions", () => {
  it("should include all READ + WRITE permissions in defaults", () => {
    expect(DEFAULT_PERMISSIONS).toContain(Permission.BRAIN_READ);
    expect(DEFAULT_PERMISSIONS).toContain(Permission.BRAIN_WRITE);
    expect(DEFAULT_PERMISSIONS).toContain(Permission.PLANNER_READ);
    expect(DEFAULT_PERMISSIONS).toContain(Permission.PLANNER_WRITE);
    expect(DEFAULT_PERMISSIONS).toContain(Permission.PLACE_READ);
    expect(DEFAULT_PERMISSIONS).toContain(Permission.PLACE_WRITE);
    expect(DEFAULT_PERMISSIONS).toContain(Permission.STORE_READ);
    expect(DEFAULT_PERMISSIONS).toContain(Permission.STORE_WRITE);
    expect(DEFAULT_PERMISSIONS).toContain(Permission.CAFE_READ);
  });

  it("should NOT include special permissions in defaults", () => {
    expect(DEFAULT_PERMISSIONS).not.toContain(Permission.PLACE_MATCH);
    expect(DEFAULT_PERMISSIONS).not.toContain(Permission.STORE_SELL);
    expect(DEFAULT_PERMISSIONS).not.toContain(Permission.CAFE_CHECKIN);
    expect(DEFAULT_PERMISSIONS).not.toContain(Permission.CAFE_DOORBELL);
  });

  it("should have 13 total permissions", () => {
    expect(ALL_PERMISSIONS).toHaveLength(13);
  });

  it("should group permissions by service", () => {
    expect(PERMISSION_GROUPS.brain).toHaveLength(2);
    expect(PERMISSION_GROUPS.planner).toHaveLength(2);
    expect(PERMISSION_GROUPS.place).toHaveLength(3);
    expect(PERMISSION_GROUPS.store).toHaveLength(3);
    expect(PERMISSION_GROUPS.cafe).toHaveLength(3);
  });

  it("should check single permission correctly", () => {
    const userPerms = [Permission.BRAIN_READ, Permission.PLACE_WRITE];

    expect(hasPermission(userPerms, Permission.BRAIN_READ)).toBe(true);
    expect(hasPermission(userPerms, Permission.PLACE_WRITE)).toBe(true);
    expect(hasPermission(userPerms, Permission.STORE_SELL)).toBe(false);
  });

  it("should check multiple permissions correctly", () => {
    const userPerms = [Permission.BRAIN_READ, Permission.BRAIN_WRITE, Permission.PLACE_READ];

    expect(hasAllPermissions(userPerms, [Permission.BRAIN_READ, Permission.BRAIN_WRITE])).toBe(true);
    expect(hasAllPermissions(userPerms, [Permission.BRAIN_READ, Permission.STORE_SELL])).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Auth Middleware
// ═══════════════════════════════════════════════════════════════════════════

describe("Auth Middleware", () => {
  const userId = "user-middleware-test";
  const permissions = DEFAULT_PERMISSIONS;

  it("should authenticate a valid Bearer token", () => {
    const tokens = generateTokens(userId, permissions);
    const result = authMiddleware({
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.user.userId).toBe(userId);
      expect(result.user.permissions).toEqual(permissions);
    }
  });

  it("should return 401 for missing Authorization header", () => {
    const result = authMiddleware({ headers: {} });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
      expect(result.error).toContain("Missing");
    }
  });

  it("should return 401 for non-Bearer token", () => {
    const result = authMiddleware({
      headers: { authorization: "Basic dXNlcjpwYXNz" },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
    }
  });

  it("should return 401 for an invalid token", () => {
    const result = authMiddleware({
      headers: { authorization: "Bearer invalid.token.here" },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
      expect(result.error).toContain("Invalid");
    }
  });

  it("should return 401 for an expired token", () => {
    // Create expired token manually
    const secret = process.env.JWT_SECRET || "dreamhub-dev-jwt-secret";
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8")
      .toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const payload = {
      sub: userId,
      permissions,
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) - 60,
      jti: "expired-middleware-test",
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8")
      .toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const sig = createHmac("sha256", secret)
      .update(`${header}.${payloadB64}`)
      .digest("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const expiredToken = `${header}.${payloadB64}.${sig}`;

    const result = authMiddleware({
      headers: { authorization: `Bearer ${expiredToken}` },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Permission Middleware (requirePermission → 403)
// ═══════════════════════════════════════════════════════════════════════════

describe("requirePermission", () => {
  it("should pass when user has the required permission", () => {
    const result = requirePermission(
      [Permission.BRAIN_READ, Permission.BRAIN_WRITE],
      Permission.BRAIN_READ,
    );
    expect(result.success).toBe(true);
  });

  it("should return 403 when user lacks the required permission", () => {
    const result = requirePermission(
      [Permission.BRAIN_READ],
      Permission.STORE_SELL,
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
      expect(result.error).toContain("store:sell");
    }
  });

  it("should return 403 when permission array is empty", () => {
    const result = requirePermission([], Permission.BRAIN_READ);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
    }
  });
});

describe("requireAllPermissions", () => {
  it("should pass when user has all required permissions", () => {
    const result = requireAllPermissions(
      [Permission.BRAIN_READ, Permission.BRAIN_WRITE, Permission.PLACE_READ],
      [Permission.BRAIN_READ, Permission.PLACE_READ],
    );
    expect(result.success).toBe(true);
  });

  it("should return 403 listing missing permissions", () => {
    const result = requireAllPermissions(
      [Permission.BRAIN_READ],
      [Permission.BRAIN_READ, Permission.STORE_SELL, Permission.CAFE_DOORBELL],
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(403);
      expect(result.error).toContain("store:sell");
      expect(result.error).toContain("cafe:doorbell");
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Social Auth Providers (Mock)
// ═══════════════════════════════════════════════════════════════════════════

describe("Social Auth Providers", () => {
  describe("MockGoogleProvider", () => {
    it("should authenticate and return user info", async () => {
      const provider = new MockGoogleProvider();
      expect(provider.name).toBe("google");

      const result = await provider.authenticate("test-user-123");

      expect(result.userId).toBe("google-test-user-123");
      expect(result.email).toBe("test-user-123@gmail.com");
      expect(result.name).toBe("Google User test-user-123");
      expect(result.picture).toBeDefined();
    });
  });

  describe("MockAppleProvider", () => {
    it("should authenticate and return user info (no picture)", async () => {
      const provider = new MockAppleProvider();
      expect(provider.name).toBe("apple");

      const result = await provider.authenticate("apple-user-456");

      expect(result.userId).toBe("apple-apple-user-456");
      expect(result.email).toBe("apple-user-456@icloud.com");
      expect(result.name).toBe("Apple User apple-user-456");
      expect(result.picture).toBeUndefined();
    });
  });

  describe("MockKakaoProvider", () => {
    it("should authenticate and return user info", async () => {
      const provider = new MockKakaoProvider();
      expect(provider.name).toBe("kakao");

      const result = await provider.authenticate("kakao-user-789");

      expect(result.userId).toBe("kakao-kakao-user-789");
      expect(result.email).toBe("kakao-user-789@kakao.com");
      expect(result.name).toBe("Kakao User kakao-user-789");
      expect(result.picture).toBeDefined();
    });
  });

  describe("createSocialProvider (factory)", () => {
    it("should create mock providers via factory", () => {
      const google = createSocialProvider("google");
      const apple = createSocialProvider("apple");
      const kakao = createSocialProvider("kakao");

      expect(google.name).toBe("google");
      expect(apple.name).toBe("apple");
      expect(kakao.name).toBe("kakao");
    });

    it("should return all 3 providers via getAllProviders", () => {
      const providers = getAllProviders();

      expect(providers).toHaveLength(3);
      const names = providers.map((p) => p.name);
      expect(names).toContain("google");
      expect(names).toContain("apple");
      expect(names).toContain("kakao");
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. End-to-End Flow: Signup → Login → Auth → Permission Check
// ═══════════════════════════════════════════════════════════════════════════

describe("End-to-End Auth Flow", () => {
  it("should complete full signup → authenticate → middleware → permission flow", async () => {
    // 1. User signs up via Google (mock)
    const google = createSocialProvider("google");
    const socialResult = await google.authenticate("new-dreamer");

    expect(socialResult.email).toBe("new-dreamer@gmail.com");

    // 2. System assigns Dream ID with default permissions
    const dreamUserId = "dream-id-001";
    const userPermissions = [...DEFAULT_PERMISSIONS];

    // 3. Generate tokens
    const tokens = generateTokens(dreamUserId, userPermissions);

    // 4. Access protected endpoint via middleware
    const authResult = authMiddleware({
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });

    expect(authResult.success).toBe(true);
    if (!authResult.success) return;

    expect(authResult.user.userId).toBe(dreamUserId);

    // 5. Check default permissions pass for READ/WRITE
    const brainRead = requirePermission(authResult.user.permissions, Permission.BRAIN_READ);
    expect(brainRead.success).toBe(true);

    const storeWrite = requirePermission(authResult.user.permissions, Permission.STORE_WRITE);
    expect(storeWrite.success).toBe(true);

    // 6. Check special permission is denied
    const storeSell = requirePermission(authResult.user.permissions, Permission.STORE_SELL);
    expect(storeSell.success).toBe(false);
    if (!storeSell.success) {
      expect(storeSell.status).toBe(403);
    }

    // 7. Refresh tokens and verify new pair works
    const newTokens = refreshTokens(tokens.refreshToken);
    const newAuth = authMiddleware({
      headers: { authorization: `Bearer ${newTokens.accessToken}` },
    });

    expect(newAuth.success).toBe(true);
    if (newAuth.success) {
      expect(newAuth.user.userId).toBe(dreamUserId);
      expect(newAuth.user.permissions).toEqual(userPermissions);
    }
  });

  it("should deny access to unauthenticated user (no token)", () => {
    const result = authMiddleware({ headers: {} });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
    }
  });

  it("should deny access to user with tampered token", () => {
    const tokens = generateTokens("hacker", [Permission.BRAIN_READ]);
    const tampered = tokens.accessToken.replace(/.$/, "X");

    const result = authMiddleware({
      headers: { authorization: `Bearer ${tampered}` },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
    }
  });
});
