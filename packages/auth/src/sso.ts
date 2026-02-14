// ---------------------------------------------------------------------------
// SSO Manager — Cross-Service Single Sign-On Orchestrator
//
// Coordinates user lifecycle events across all Dream Hub services:
//   1. Registration  → USER_REGISTERED event → all services create records
//   2. Profile update → USER_UPDATED event  → all services sync changes
//   3. Account delete → USER_DELETED event  → all services clean up
//
// All services share the same JWT secret, so a token issued by any service
// is valid across the entire Dream Hub ecosystem.
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §13
// ---------------------------------------------------------------------------

import { randomUUID } from "crypto";
import type { EventBus } from "@dreamhub/event-bus";
import type { DreamUser, TokenPair, SocialProvider } from "@dreamhub/shared-types";
import { generateTokens, verifyToken } from "./jwt";
import { UserStore } from "./user-store";

/** Records created by each service when a new user registers */
export interface ServiceInitRecords {
  brain: { userId: string; thoughts: number; embedding: null };
  planner: { userId: string; gritScore: number; currentPart: number };
  place: { userId: string; dnaInitialized: boolean; coldStartStrategy: string };
  store: { userId: string; products: number; revenue: number };
}

/** Result of SSO registration */
export interface SSORegistrationResult {
  user: DreamUser;
  tokens: TokenPair;
  eventPublished: boolean;
}

/** Result of SSO social login */
export interface SSOSocialLoginResult {
  user: DreamUser;
  tokens: TokenPair;
  isNewUser: boolean;
  eventPublished: boolean;
}

/** Result of SSO profile update */
export interface SSOUpdateResult {
  user: DreamUser;
  eventPublished: boolean;
}

/** Result of SSO account deletion */
export interface SSODeletionResult {
  userId: string;
  deletedAt: string;
  eventPublished: boolean;
}

/**
 * SSO Manager orchestrates user lifecycle across all Dream Hub services.
 *
 * Usage:
 *   const sso = new SSOManager(eventBus, userStore);
 *   const result = await sso.register(email, password, name);
 *   // → user created, tokens generated, USER_REGISTERED event published
 *   // → all subscribed services create initial records
 */
export class SSOManager {
  constructor(
    private readonly bus: EventBus,
    private readonly store: UserStore,
  ) {}

  /**
   * Register a new user via email/password and broadcast to all services.
   *
   * Flow:
   * 1. Create user in auth store
   * 2. Generate JWT tokens (shared secret — valid everywhere)
   * 3. Publish USER_REGISTERED event
   * 4. Each service's event handler creates initial records
   */
  async register(
    email: string,
    password: string,
    name: string,
    preferredLanguage = "en",
  ): Promise<SSORegistrationResult> {
    const user = await this.store.register(email, password, name);

    // Override default language if specified
    if (preferredLanguage !== "en") {
      this.store.updateProfile(user.id, { preferredLanguage });
      user.preferredLanguage = preferredLanguage;
    }

    const tokens = generateTokens(user.id, user.permissions);

    await this.bus.publish("dream.auth.user_registered", {
      userId: user.id,
      email: user.email,
      name: user.name,
      preferredLanguage: user.preferredLanguage,
    });

    return { user, tokens, eventPublished: true };
  }

  /**
   * Register or login via social provider and broadcast if new user.
   */
  async socialLogin(
    provider: SocialProvider,
    providerAccountId: string,
    email: string,
    name: string,
    picture?: string,
  ): Promise<SSOSocialLoginResult> {
    const { user, isNewUser } = this.store.registerSocial(
      provider,
      providerAccountId,
      email,
      name,
      picture,
    );

    const tokens = generateTokens(user.id, user.permissions);

    let eventPublished = false;
    if (isNewUser) {
      await this.bus.publish("dream.auth.user_registered", {
        userId: user.id,
        email: user.email,
        name: user.name,
        preferredLanguage: user.preferredLanguage,
      });
      eventPublished = true;
    }

    return { user, tokens, isNewUser, eventPublished };
  }

  /**
   * Update user profile and broadcast changes to all services.
   */
  async updateProfile(
    userId: string,
    changes: {
      name?: string;
      email?: string;
      profileImageUrl?: string;
      preferredLanguage?: string;
    },
  ): Promise<SSOUpdateResult> {
    const user = this.store.updateProfile(userId, changes);

    await this.bus.publish("dream.auth.user_updated", {
      userId,
      changes,
    });

    return { user, eventPublished: true };
  }

  /**
   * Delete user account and broadcast to all services for cleanup.
   */
  async deleteAccount(userId: string): Promise<SSODeletionResult> {
    const user = this.store.deleteUser(userId);
    const deletedAt = new Date().toISOString();

    await this.bus.publish("dream.auth.user_deleted", {
      userId,
      deletedAt,
    });

    return { userId, deletedAt, eventPublished: true };
  }

  /**
   * Verify a token from any service (shared JWT secret).
   * This is the core SSO mechanism — tokens are valid across all services.
   */
  verifyAcrossServices(token: string): { userId: string; isValid: boolean } {
    // All services use the same verifyToken from jwt.ts,
    // which uses the shared JWT_SECRET.
    const payload = verifyToken(token);
    return { userId: payload.userId, isValid: payload.isValid };
  }
}
