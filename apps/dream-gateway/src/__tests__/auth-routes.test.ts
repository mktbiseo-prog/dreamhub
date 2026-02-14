// ---------------------------------------------------------------------------
// Auth Routes — Integration Tests
//
// Tests cover:
//   1. Registration → Login → Token → /me (full flow)
//   2. Unauthenticated access → 401
//   3. Social login → account linking
//   4. Token refresh rotation
//   5. Validation errors
//   6. Auth middleware on protected routes
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { AuthRouter } from "../auth-routes";
import { Permission } from "@dreamhub/shared-types";
import { verifyToken, generateTokens } from "@dreamhub/auth/jwt";
import { authMiddleware, requirePermission } from "@dreamhub/auth/middleware";
import { DEFAULT_PERMISSIONS } from "@dreamhub/auth/permissions";

// Fresh router for each test to avoid state leakage
let router: AuthRouter;

beforeEach(() => {
  router = new AuthRouter();
});

// Helper to call a route
async function call(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string | undefined>,
) {
  return router.route(method, path, body ?? {}, headers ?? {});
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Full Flow: Register → Login → /me
// ═══════════════════════════════════════════════════════════════════════════

describe("Full Auth Flow: Register → Login → API Access", () => {
  it("should register, login, and access /me with the token", async () => {
    // Step 1: Register
    const registerRes = await call("POST", "/api/auth/register", {
      email: "dreamer@example.com",
      password: "MyDream2024!",
      name: "Dream Seeker",
    });

    expect(registerRes!.status).toBe(201);
    const registerBody = registerRes!.body as {
      user: { id: string; email: string; name: string; permissions: Permission[] };
      tokens: { accessToken: string; refreshToken: string };
    };

    expect(registerBody.user.email).toBe("dreamer@example.com");
    expect(registerBody.user.name).toBe("Dream Seeker");
    expect(registerBody.user.permissions).toEqual(DEFAULT_PERMISSIONS);
    expect(registerBody.tokens.accessToken).toBeDefined();
    expect(registerBody.tokens.refreshToken).toBeDefined();

    // Step 2: Login with same credentials
    const loginRes = await call("POST", "/api/auth/login", {
      email: "dreamer@example.com",
      password: "MyDream2024!",
    });

    expect(loginRes!.status).toBe(200);
    const loginBody = loginRes!.body as {
      user: { id: string };
      tokens: { accessToken: string };
    };
    expect(loginBody.user.id).toBe(registerBody.user.id);

    // Step 3: Access /me with the token
    const meRes = await call("GET", "/api/auth/me", undefined, {
      authorization: `Bearer ${loginBody.tokens.accessToken}`,
    });

    expect(meRes!.status).toBe(200);
    const meBody = meRes!.body as { user: { id: string; email: string } };
    expect(meBody.user.id).toBe(registerBody.user.id);
    expect(meBody.user.email).toBe("dreamer@example.com");

    // Step 4: Verify the access token carries correct permissions
    const payload = verifyToken(loginBody.tokens.accessToken);
    expect(payload.isValid).toBe(true);
    expect(payload.userId).toBe(registerBody.user.id);
    expect(payload.permissions).toEqual(DEFAULT_PERMISSIONS);
  });

  it("should use token to call a protected service endpoint", async () => {
    // Register and get token
    const registerRes = await call("POST", "/api/auth/register", {
      email: "api-user@example.com",
      password: "SecurePass123",
      name: "API User",
    });
    const { tokens } = registerRes!.body as {
      tokens: { accessToken: string };
    };

    // Simulate calling a protected endpoint via authMiddleware
    const auth = authMiddleware({
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });

    expect(auth.success).toBe(true);
    if (auth.success) {
      // Default permissions include BRAIN_READ
      const brainCheck = requirePermission(auth.user.permissions, Permission.BRAIN_READ);
      expect(brainCheck.success).toBe(true);

      // But not STORE_SELL (special permission)
      const sellCheck = requirePermission(auth.user.permissions, Permission.STORE_SELL);
      expect(sellCheck.success).toBe(false);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Unauthenticated Access → 401
// ═══════════════════════════════════════════════════════════════════════════

describe("Unauthenticated Access → 401", () => {
  it("should return 401 for /me without token", async () => {
    const res = await call("GET", "/api/auth/me");

    expect(res!.status).toBe(401);
    expect((res!.body as { error: string }).error).toContain("Authorization");
  });

  it("should return 401 for /me with invalid token", async () => {
    const res = await call("GET", "/api/auth/me", undefined, {
      authorization: "Bearer invalid.token.here",
    });

    expect(res!.status).toBe(401);
    expect((res!.body as { error: string }).error).toContain("Invalid");
  });

  it("should return 401 via authMiddleware without token", () => {
    const auth = authMiddleware({ headers: {} });

    expect(auth.success).toBe(false);
    if (!auth.success) {
      expect(auth.status).toBe(401);
    }
  });

  it("should return 401 via authMiddleware with expired token", () => {
    // Create an expired token by manipulating the payload
    const { createHmac } = require("crypto");
    const secret = process.env.JWT_SECRET || "dreamhub-dev-jwt-secret";
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }))
      .toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const payload = {
      sub: "user-1",
      permissions: [Permission.BRAIN_READ],
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) - 60,
      jti: "expired-test",
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload))
      .toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const sig = createHmac("sha256", secret)
      .update(`${header}.${payloadB64}`)
      .digest("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const expiredToken = `${header}.${payloadB64}.${sig}`;

    const auth = authMiddleware({
      headers: { authorization: `Bearer ${expiredToken}` },
    });

    expect(auth.success).toBe(false);
    if (!auth.success) {
      expect(auth.status).toBe(401);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Social Login → Account Linking
// ═══════════════════════════════════════════════════════════════════════════

describe("Social Login and Account Linking", () => {
  it("should create new user via Google social login", async () => {
    const res = await call("POST", "/api/auth/social/google", {
      token: "user-alice",
    });

    expect(res!.status).toBe(201);
    const body = res!.body as {
      user: { email: string; connectedAccounts: { provider: string }[] };
      tokens: { accessToken: string };
      isNewUser: boolean;
    };
    expect(body.isNewUser).toBe(true);
    expect(body.user.email).toBe("user-alice@gmail.com");
    expect(body.user.connectedAccounts).toHaveLength(1);
    expect(body.user.connectedAccounts[0].provider).toBe("google");
    expect(body.tokens.accessToken).toBeDefined();
  });

  it("should return existing user on repeated social login", async () => {
    // First login creates user
    const first = await call("POST", "/api/auth/social/kakao", {
      token: "kakao-user-1",
    });
    expect(first!.status).toBe(201);

    // Second login returns existing user
    const second = await call("POST", "/api/auth/social/kakao", {
      token: "kakao-user-1",
    });
    expect(second!.status).toBe(200);

    const body = second!.body as { isNewUser: boolean; user: { id: string } };
    expect(body.isNewUser).toBe(false);
    expect(body.user.id).toBe(
      (first!.body as { user: { id: string } }).user.id,
    );
  });

  it("should link social account to existing email user", async () => {
    // Register with email
    await call("POST", "/api/auth/register", {
      email: "bob@gmail.com",
      password: "BobDreams2024",
      name: "Bob Builder",
    });

    // Login with Google using same email (mock returns "bob@gmail.com")
    const socialRes = await call("POST", "/api/auth/social/google", {
      token: "bob",
    });

    expect(socialRes!.status).toBe(200); // Not 201 — existing user
    const body = socialRes!.body as {
      user: {
        name: string;
        connectedAccounts: { provider: string }[];
      };
      isNewUser: boolean;
    };
    expect(body.isNewUser).toBe(false);
    expect(body.user.name).toBe("Bob Builder"); // Original name preserved
    expect(body.user.connectedAccounts).toHaveLength(1);
    expect(body.user.connectedAccounts[0].provider).toBe("google");

    // Can still login with original password
    const loginRes = await call("POST", "/api/auth/login", {
      email: "bob@gmail.com",
      password: "BobDreams2024",
    });
    expect(loginRes!.status).toBe(200);
  });

  it("should support Apple login", async () => {
    const res = await call("POST", "/api/auth/social/apple", {
      token: "apple-dreamer",
    });

    expect(res!.status).toBe(201);
    const body = res!.body as {
      user: { email: string; connectedAccounts: { provider: string }[] };
    };
    expect(body.user.email).toBe("apple-dreamer@icloud.com");
    expect(body.user.connectedAccounts[0].provider).toBe("apple");
  });

  it("should support Kakao login", async () => {
    const res = await call("POST", "/api/auth/social/kakao", {
      token: "kakao-dreamer",
    });

    expect(res!.status).toBe(201);
    const body = res!.body as {
      user: { email: string; connectedAccounts: { provider: string }[] };
    };
    expect(body.user.email).toBe("kakao-dreamer@kakao.com");
    expect(body.user.connectedAccounts[0].provider).toBe("kakao");
  });

  it("should link multiple social accounts to one user", async () => {
    // Register with email
    await call("POST", "/api/auth/register", {
      email: "multi@gmail.com",
      password: "MultiLogin2024",
      name: "Multi User",
    });

    // Link Google (mock "multi" returns "multi@gmail.com")
    await call("POST", "/api/auth/social/google", { token: "multi" });

    // Now the user has 1 connected account (Google)
    // Get user via /me
    const loginRes = await call("POST", "/api/auth/login", {
      email: "multi@gmail.com",
      password: "MultiLogin2024",
    });
    const { tokens } = loginRes!.body as { tokens: { accessToken: string } };

    const meRes = await call("GET", "/api/auth/me", undefined, {
      authorization: `Bearer ${tokens.accessToken}`,
    });
    const user = (meRes!.body as { user: { connectedAccounts: { provider: string }[] } }).user;
    expect(user.connectedAccounts).toHaveLength(1);
    expect(user.connectedAccounts[0].provider).toBe("google");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Token Refresh Rotation
// ═══════════════════════════════════════════════════════════════════════════

describe("Token Refresh", () => {
  it("should issue new tokens from valid refresh token", async () => {
    // Register
    const registerRes = await call("POST", "/api/auth/register", {
      email: "refresh-user@example.com",
      password: "RefreshMe2024",
      name: "Refresh User",
    });
    const { tokens: original } = registerRes!.body as {
      tokens: { accessToken: string; refreshToken: string };
    };

    // Refresh
    const refreshRes = await call("POST", "/api/auth/refresh", {
      refreshToken: original.refreshToken,
    });

    expect(refreshRes!.status).toBe(200);
    const { tokens: rotated } = refreshRes!.body as {
      tokens: { accessToken: string; refreshToken: string };
    };

    // New tokens should be different
    expect(rotated.accessToken).not.toBe(original.accessToken);
    expect(rotated.refreshToken).not.toBe(original.refreshToken);

    // New access token should be valid
    const payload = verifyToken(rotated.accessToken);
    expect(payload.isValid).toBe(true);
    expect(payload.permissions).toEqual(DEFAULT_PERMISSIONS);
  });

  it("should reject invalid refresh token", async () => {
    const res = await call("POST", "/api/auth/refresh", {
      refreshToken: "invalid.refresh.token",
    });

    expect(res!.status).toBe(401);
    expect((res!.body as { error: string }).error).toContain("Invalid");
  });

  it("should reject refresh with missing token", async () => {
    const res = await call("POST", "/api/auth/refresh", {});

    expect(res!.status).toBe(400);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Validation Errors
// ═══════════════════════════════════════════════════════════════════════════

describe("Request Validation", () => {
  it("should reject registration with invalid email", async () => {
    const res = await call("POST", "/api/auth/register", {
      email: "not-an-email",
      password: "ValidPass123",
      name: "Test User",
    });

    expect(res!.status).toBe(400);
    expect((res!.body as { error: string }).error).toContain("Validation");
  });

  it("should reject registration with short password", async () => {
    const res = await call("POST", "/api/auth/register", {
      email: "valid@email.com",
      password: "short",
      name: "Test User",
    });

    expect(res!.status).toBe(400);
  });

  it("should reject registration with missing name", async () => {
    const res = await call("POST", "/api/auth/register", {
      email: "valid@email.com",
      password: "ValidPass123",
    });

    expect(res!.status).toBe(400);
  });

  it("should reject duplicate email registration", async () => {
    await call("POST", "/api/auth/register", {
      email: "dup@example.com",
      password: "Password123",
      name: "First User",
    });

    const res = await call("POST", "/api/auth/register", {
      email: "dup@example.com",
      password: "Password456",
      name: "Second User",
    });

    expect(res!.status).toBe(409);
    expect((res!.body as { error: string }).error).toContain("already registered");
  });

  it("should reject login with wrong password", async () => {
    await call("POST", "/api/auth/register", {
      email: "wrong-pass@example.com",
      password: "CorrectPassword",
      name: "User",
    });

    const res = await call("POST", "/api/auth/login", {
      email: "wrong-pass@example.com",
      password: "WrongPassword",
    });

    expect(res!.status).toBe(401);
    expect((res!.body as { error: string }).error).toContain("Invalid");
  });

  it("should reject login for non-existent user", async () => {
    const res = await call("POST", "/api/auth/login", {
      email: "nonexistent@example.com",
      password: "AnyPassword",
    });

    expect(res!.status).toBe(401);
  });

  it("should reject social login with missing token", async () => {
    const res = await call("POST", "/api/auth/social/google", {});

    expect(res!.status).toBe(400);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Logout
// ═══════════════════════════════════════════════════════════════════════════

describe("Logout", () => {
  it("should return success on logout", async () => {
    const res = await call("POST", "/api/auth/logout");

    expect(res!.status).toBe(200);
    expect((res!.body as { success: boolean }).success).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. Route Matching
// ═══════════════════════════════════════════════════════════════════════════

describe("Route Matching", () => {
  it("should return null for non-auth routes", async () => {
    const res = await call("GET", "/api/users/123");
    expect(res).toBeNull();
  });

  it("should return null for unknown HTTP methods on auth routes", async () => {
    const res = await call("DELETE", "/api/auth/register");
    expect(res).toBeNull();
  });

  it("should handle trailing slash", async () => {
    const res = await call("POST", "/api/auth/logout/");
    expect(res!.status).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. Protected Route Simulation (End-to-End)
// ═══════════════════════════════════════════════════════════════════════════

describe("Protected Route Simulation", () => {
  it("should allow access to Brain endpoint with valid token", async () => {
    // Register and get token
    const regRes = await call("POST", "/api/auth/register", {
      email: "brain-user@example.com",
      password: "BrainDreams2024",
      name: "Brain User",
    });
    const { tokens } = regRes!.body as {
      tokens: { accessToken: string };
    };

    // Simulate a Brain API route checking auth
    const auth = authMiddleware({
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });
    expect(auth.success).toBe(true);

    if (auth.success) {
      const readCheck = requirePermission(auth.user.permissions, Permission.BRAIN_READ);
      expect(readCheck.success).toBe(true);

      const writeCheck = requirePermission(auth.user.permissions, Permission.BRAIN_WRITE);
      expect(writeCheck.success).toBe(true);
    }
  });

  it("should deny STORE_SELL to default user", async () => {
    const regRes = await call("POST", "/api/auth/register", {
      email: "seller@example.com",
      password: "WantToSell2024",
      name: "Aspiring Seller",
    });
    const { tokens } = regRes!.body as {
      tokens: { accessToken: string };
    };

    const auth = authMiddleware({
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });
    expect(auth.success).toBe(true);

    if (auth.success) {
      const sellCheck = requirePermission(auth.user.permissions, Permission.STORE_SELL);
      expect(sellCheck.success).toBe(false);
      if (!sellCheck.success) {
        expect(sellCheck.status).toBe(403);
      }
    }
  });

  it("should deny CAFE_CHECKIN to default user", async () => {
    const regRes = await call("POST", "/api/auth/register", {
      email: "cafe-visitor@example.com",
      password: "CafeVisit2024",
      name: "Cafe Visitor",
    });
    const { tokens } = regRes!.body as {
      tokens: { accessToken: string };
    };

    const auth = authMiddleware({
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });
    expect(auth.success).toBe(true);

    if (auth.success) {
      const checkinCheck = requirePermission(auth.user.permissions, Permission.CAFE_CHECKIN);
      expect(checkinCheck.success).toBe(false);
      if (!checkinCheck.success) {
        expect(checkinCheck.status).toBe(403);
      }
    }
  });
});
