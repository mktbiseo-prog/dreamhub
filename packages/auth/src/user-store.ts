// ---------------------------------------------------------------------------
// In-Memory User Store
//
// Development/testing store for Dream ID users. In production, replace
// with Prisma/PostgreSQL queries via @dreamhub/database.
//
// Supports:
//   - Email/password registration with bcrypt hashing
//   - Social account registration and linking
//   - Lookup by ID, email, or social account
// ---------------------------------------------------------------------------

import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { Permission } from "@dreamhub/shared-types";
import type { DreamUser, ConnectedAccount, SocialProvider } from "@dreamhub/shared-types";
import { DEFAULT_PERMISSIONS } from "./permissions";

const BCRYPT_ROUNDS = 10;

interface StoredUser {
  user: DreamUser;
  hashedPassword?: string;
}

export class UserStore {
  private users = new Map<string, StoredUser>();
  private emailIndex = new Map<string, string>(); // email → userId
  private socialIndex = new Map<string, string>(); // "provider:accountId" → userId

  /**
   * Register a new user with email and password.
   * @throws Error if email is already registered
   */
  async register(email: string, password: string, name: string): Promise<DreamUser> {
    if (this.emailIndex.has(email)) {
      throw new Error("Email already registered");
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user: DreamUser = {
      id,
      email,
      name,
      preferredLanguage: "en",
      connectedAccounts: [],
      permissions: [...DEFAULT_PERMISSIONS],
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, { user, hashedPassword });
    this.emailIndex.set(email, id);

    return user;
  }

  /**
   * Verify email/password credentials.
   * @throws Error if credentials are invalid
   */
  async login(email: string, password: string): Promise<DreamUser> {
    const userId = this.emailIndex.get(email);
    if (!userId) throw new Error("Invalid email or password");

    const stored = this.users.get(userId)!;
    if (!stored.hashedPassword) {
      throw new Error("This account uses social login. Please sign in with your connected provider.");
    }

    const valid = await bcrypt.compare(password, stored.hashedPassword);
    if (!valid) throw new Error("Invalid email or password");

    return stored.user;
  }

  /**
   * Register or retrieve a user via social login.
   * If the social account is already linked, returns the existing user.
   * If the email matches an existing user, links the social account.
   * Otherwise, creates a new user.
   */
  registerSocial(
    provider: SocialProvider,
    providerAccountId: string,
    email: string,
    name: string,
    picture?: string,
  ): { user: DreamUser; isNewUser: boolean } {
    // Check if social account already linked
    const existing = this.findBySocialAccount(provider, providerAccountId);
    if (existing) return { user: existing, isNewUser: false };

    // Check if email already registered — link the social account
    const existingByEmail = this.findByEmail(email);
    if (existingByEmail) {
      const linked = this.linkSocialAccount(existingByEmail.id, {
        provider,
        providerAccountId,
        email,
        name,
        picture,
        connectedAt: new Date().toISOString(),
      });
      return { user: linked, isNewUser: false };
    }

    // New user
    const id = randomUUID();
    const now = new Date().toISOString();

    const account: ConnectedAccount = {
      provider,
      providerAccountId,
      email,
      name,
      picture,
      connectedAt: now,
    };

    const user: DreamUser = {
      id,
      email,
      name,
      profileImageUrl: picture,
      preferredLanguage: "en",
      connectedAccounts: [account],
      permissions: [...DEFAULT_PERMISSIONS],
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, { user });
    this.emailIndex.set(email, id);
    this.socialIndex.set(`${provider}:${providerAccountId}`, id);

    return { user, isNewUser: true };
  }

  /**
   * Link a social account to an existing user.
   * @throws Error if user not found
   */
  linkSocialAccount(userId: string, account: ConnectedAccount): DreamUser {
    const stored = this.users.get(userId);
    if (!stored) throw new Error("User not found");

    const key = `${account.provider}:${account.providerAccountId}`;
    this.socialIndex.set(key, userId);

    stored.user.connectedAccounts.push(account);
    stored.user.updatedAt = new Date().toISOString();

    return stored.user;
  }

  findById(id: string): DreamUser | undefined {
    return this.users.get(id)?.user;
  }

  findByEmail(email: string): DreamUser | undefined {
    const userId = this.emailIndex.get(email);
    if (!userId) return undefined;
    return this.users.get(userId)?.user;
  }

  findBySocialAccount(provider: SocialProvider, accountId: string): DreamUser | undefined {
    const key = `${provider}:${accountId}`;
    const userId = this.socialIndex.get(key);
    if (!userId) return undefined;
    return this.users.get(userId)?.user;
  }

  /**
   * Update a user's profile fields.
   * @throws Error if user not found
   */
  updateProfile(
    userId: string,
    changes: {
      name?: string;
      email?: string;
      profileImageUrl?: string;
      preferredLanguage?: string;
    },
  ): DreamUser {
    const stored = this.users.get(userId);
    if (!stored) throw new Error("User not found");

    // If email is changing, update the email index
    if (changes.email && changes.email !== stored.user.email) {
      if (this.emailIndex.has(changes.email)) {
        throw new Error("Email already registered");
      }
      this.emailIndex.delete(stored.user.email);
      this.emailIndex.set(changes.email, userId);
    }

    if (changes.name !== undefined) stored.user.name = changes.name;
    if (changes.email !== undefined) stored.user.email = changes.email;
    if (changes.profileImageUrl !== undefined) stored.user.profileImageUrl = changes.profileImageUrl;
    if (changes.preferredLanguage !== undefined) stored.user.preferredLanguage = changes.preferredLanguage;
    stored.user.updatedAt = new Date().toISOString();

    return stored.user;
  }

  /**
   * Delete a user and all associated indexes.
   * @throws Error if user not found
   */
  deleteUser(userId: string): DreamUser {
    const stored = this.users.get(userId);
    if (!stored) throw new Error("User not found");

    // Remove email index
    this.emailIndex.delete(stored.user.email);

    // Remove all social indexes
    for (const account of stored.user.connectedAccounts) {
      this.socialIndex.delete(`${account.provider}:${account.providerAccountId}`);
    }

    // Remove user
    this.users.delete(userId);

    return stored.user;
  }

  /** Clear all data (for testing) */
  clear(): void {
    this.users.clear();
    this.emailIndex.clear();
    this.socialIndex.clear();
  }

  /** Get total user count */
  get size(): number {
    return this.users.size;
  }
}

/** Singleton store for development and testing */
export const userStore = new UserStore();
