// ---------------------------------------------------------------------------
// Social Auth Providers — Mock + Interface
//
// Each provider implements `SocialAuthProvider.authenticate(token)`.
// In production, replace mock providers with real OAuth flows.
//
// Environment variable: AUTH_PROVIDER=mock | google | apple | kakao
// When AUTH_PROVIDER=mock (default), all providers return deterministic
// test data derived from the token string.
// ---------------------------------------------------------------------------

import type { SocialProvider, SocialAuthResult } from "@dreamhub/shared-types";

/**
 * Interface that every social auth provider must implement.
 * In production, `authenticate` exchanges an OAuth token/code for user info.
 */
export interface SocialAuthProvider {
  readonly name: SocialProvider;
  authenticate(token: string): Promise<SocialAuthResult>;
}

// ── Mock Providers ──────────────────────────────────────────────────────────

export class MockGoogleProvider implements SocialAuthProvider {
  readonly name: SocialProvider = "google";

  async authenticate(token: string): Promise<SocialAuthResult> {
    return {
      userId: `google-${token}`,
      email: `${token}@gmail.com`,
      name: `Google User ${token}`,
      picture: `https://lh3.googleusercontent.com/a/${token}`,
    };
  }
}

export class MockAppleProvider implements SocialAuthProvider {
  readonly name: SocialProvider = "apple";

  async authenticate(token: string): Promise<SocialAuthResult> {
    return {
      userId: `apple-${token}`,
      email: `${token}@icloud.com`,
      name: `Apple User ${token}`,
      // Apple often doesn't return a picture
    };
  }
}

export class MockKakaoProvider implements SocialAuthProvider {
  readonly name: SocialProvider = "kakao";

  async authenticate(token: string): Promise<SocialAuthResult> {
    return {
      userId: `kakao-${token}`,
      email: `${token}@kakao.com`,
      name: `Kakao User ${token}`,
      picture: `https://k.kakaocdn.net/dn/${token}/photo.jpg`,
    };
  }
}

// ── Provider Factory ────────────────────────────────────────────────────────

/**
 * Create a social auth provider instance.
 *
 * Reads `AUTH_PROVIDER` env var to decide between mock and real providers.
 * Default: mock (safe for development and testing).
 *
 * TODO: Implement real OAuth providers:
 *   - Google: use googleapis or passport-google-oauth20
 *   - Apple: use apple-signin-auth
 *   - Kakao: use Kakao REST API
 */
export function createSocialProvider(provider: SocialProvider): SocialAuthProvider {
  const mode = process.env.AUTH_PROVIDER || "mock";

  if (mode === "mock") {
    switch (provider) {
      case "google":
        return new MockGoogleProvider();
      case "apple":
        return new MockAppleProvider();
      case "kakao":
        return new MockKakaoProvider();
    }
  }

  // TODO: Real provider implementations
  throw new Error(
    `Real "${provider}" OAuth provider not yet implemented. ` +
    `Set AUTH_PROVIDER=mock for development.`,
  );
}

/**
 * Get all available social auth providers.
 */
export function getAllProviders(): SocialAuthProvider[] {
  const providers: SocialProvider[] = ["google", "apple", "kakao"];
  return providers.map(createSocialProvider);
}
