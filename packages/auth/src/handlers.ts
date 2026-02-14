// ---------------------------------------------------------------------------
// Auth Handlers — Pure business logic for auth API endpoints
//
// Each handler takes parsed input and returns { status, body }.
// These are framework-agnostic: the gateway maps HTTP routes to handlers.
//
// Endpoints:
//   POST /api/auth/register         → register()
//   POST /api/auth/login            → login()
//   POST /api/auth/social/:provider → socialLogin()
//   POST /api/auth/refresh          → refresh()
//   POST /api/auth/logout           → logout()
//   GET  /api/auth/me               → me()
// ---------------------------------------------------------------------------

import { z } from "zod";
import type { DreamUser, TokenPair, SocialProvider } from "@dreamhub/shared-types";
import { generateTokens, verifyToken, refreshTokens } from "./jwt";
import { createSocialProvider } from "./social-providers";
import { UserStore, userStore } from "./user-store";

// ── Request schemas ─────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const socialLoginSchema = z.object({
  token: z.string().min(1, "OAuth token is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// ── Response type ───────────────────────────────────────────────────────────

export interface HandlerResponse<T = unknown> {
  status: number;
  body: T;
}

// ── Handlers ────────────────────────────────────────────────────────────────

export class AuthHandlers {
  constructor(private store: UserStore = userStore) {}

  /**
   * POST /api/auth/register
   * Create a new Dream ID with email/password.
   */
  async register(body: unknown): Promise<HandlerResponse> {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return {
        status: 400,
        body: { error: "Validation failed", details: parsed.error.flatten() },
      };
    }

    try {
      const user = await this.store.register(
        parsed.data.email,
        parsed.data.password,
        parsed.data.name,
      );
      const tokens = generateTokens(user.id, user.permissions);
      return { status: 201, body: { user, tokens } };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      if (message.includes("already registered")) {
        return { status: 409, body: { error: message } };
      }
      return { status: 500, body: { error: message } };
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate with email/password.
   */
  async login(body: unknown): Promise<HandlerResponse> {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return {
        status: 400,
        body: { error: "Validation failed", details: parsed.error.flatten() },
      };
    }

    try {
      const user = await this.store.login(parsed.data.email, parsed.data.password);
      const tokens = generateTokens(user.id, user.permissions);
      return { status: 200, body: { user, tokens } };
    } catch {
      return { status: 401, body: { error: "Invalid email or password" } };
    }
  }

  /**
   * POST /api/auth/social/:provider
   * Authenticate via social provider (Google, Apple, Kakao).
   * Links to existing account if email matches, otherwise creates new user.
   */
  async socialLogin(provider: SocialProvider, body: unknown): Promise<HandlerResponse> {
    const parsed = socialLoginSchema.safeParse(body);
    if (!parsed.success) {
      return {
        status: 400,
        body: { error: "Validation failed", details: parsed.error.flatten() },
      };
    }

    try {
      const authProvider = createSocialProvider(provider);
      const socialResult = await authProvider.authenticate(parsed.data.token);

      const { user, isNewUser } = this.store.registerSocial(
        provider,
        socialResult.userId,
        socialResult.email,
        socialResult.name,
        socialResult.picture,
      );

      const tokens = generateTokens(user.id, user.permissions);

      return {
        status: isNewUser ? 201 : 200,
        body: { user, tokens, isNewUser },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Social login failed";
      return { status: 401, body: { error: message } };
    }
  }

  /**
   * POST /api/auth/refresh
   * Exchange a refresh token for a new token pair (rotation).
   */
  refresh(body: unknown): HandlerResponse {
    const parsed = refreshSchema.safeParse(body);
    if (!parsed.success) {
      return { status: 400, body: { error: "Refresh token is required" } };
    }

    try {
      const tokens = refreshTokens(parsed.data.refreshToken);
      return { status: 200, body: { tokens } };
    } catch {
      return { status: 401, body: { error: "Invalid or expired refresh token" } };
    }
  }

  /**
   * POST /api/auth/logout
   * Client-side logout. With stateless JWT, the client discards the tokens.
   * In a stateful implementation, this would revoke the refresh token.
   */
  logout(): HandlerResponse {
    return {
      status: 200,
      body: { success: true, message: "Logged out successfully" },
    };
  }

  /**
   * GET /api/auth/me
   * Return the current user's profile from the access token.
   */
  me(authHeader?: string | null): HandlerResponse {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { status: 401, body: { error: "Missing Authorization header" } };
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload.isValid) {
      return { status: 401, body: { error: "Invalid or expired token" } };
    }

    const user = this.store.findById(payload.userId);
    if (!user) {
      return { status: 404, body: { error: "User not found" } };
    }

    return { status: 200, body: { user } };
  }
}

/** Default singleton using the shared in-memory store */
export const authHandlers = new AuthHandlers();
