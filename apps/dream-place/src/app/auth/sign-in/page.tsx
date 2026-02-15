"use client";

import { useState } from "react";
import { Button, Input, Card } from "@dreamhub/design-system";

const SOCIAL_BUTTONS = [
  {
    provider: "google" as const,
    label: "Continue with Google",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
    className: "bg-white text-[var(--dream-neutral-800)] border border-[var(--dream-neutral-300)] hover:bg-[var(--dream-neutral-50)]",
  },
  {
    provider: "apple" as const,
    label: "Continue with Apple",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
    className: "bg-black text-white hover:bg-[var(--dream-neutral-800)]",
  },
  {
    provider: "kakao" as const,
    label: "Continue with KakaoTalk",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d="M12 3C6.48 3 2 6.36 2 10.42c0 2.62 1.75 4.93 4.37 6.23l-1.12 4.15c-.1.35.31.64.62.44l4.94-3.26c.38.04.78.06 1.19.06 5.52 0 10-3.36 10-7.62S17.52 3 12 3z" fill="#3C1E1E" />
      </svg>
    ),
    className: "bg-[#FEE500] text-[#3C1E1E] hover:bg-[#F5DC00]",
  },
];

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate auth delay for realistic demo feel
    await new Promise((r) => setTimeout(r, 800));

    localStorage.setItem("dreamhub_access_token", "demo-token");
    localStorage.setItem("dreamhub_user_email", email);
    // Set cookie so middleware recognizes the session
    document.cookie = "dreamhub-demo-session=true; path=/; max-age=604800; SameSite=Lax";

    if (mode === "signup") {
      window.location.href = "/auth/onboarding";
    } else {
      window.location.href = "/";
    }
  }

  async function handleSocialLogin(provider: "google" | "apple" | "kakao") {
    setError(null);
    setIsLoading(true);

    // Simulate auth delay for realistic demo feel
    await new Promise((r) => setTimeout(r, 800));

    localStorage.setItem("dreamhub_access_token", "demo-token");
    localStorage.setItem("dreamhub_user_email", `demo@${provider}.com`);
    // Set cookie so middleware recognizes the session
    document.cookie = "dreamhub-demo-session=true; path=/; max-age=604800; SameSite=Lax";

    window.location.href = "/auth/onboarding";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--dream-hub-dark)] to-[#2D1B69] px-4 py-8">
      <Card
        variant="elevated"
        className="w-full max-w-[480px] bg-[var(--dream-color-surface)] p-8 md:p-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-[var(--dream-radius-md)] bg-[var(--dream-hub-dark)] flex items-center justify-center">
              <span className="text-xl" style={{ color: "#FFC300" }}>
                D
              </span>
            </div>
            <span className="text-xl font-bold text-[var(--dream-color-text-primary)]">
              Dream Hub
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-center text-2xl font-bold text-[var(--dream-color-text-primary)] mb-2">
          {mode === "signup" ? "Create your Dream ID" : "Sign in to Dream Hub"}
        </h1>
        <p className="text-center text-sm text-[var(--dream-color-text-secondary)] mb-8">
          {mode === "signup"
            ? "One account for all Dream Hub services"
            : "Welcome back, dreamer"}
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-[var(--dream-radius-md)] bg-[var(--dream-error-light)] text-[var(--dream-error)] text-sm">
            {error}
          </div>
        )}

        {/* Social Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          {SOCIAL_BUTTONS.map((btn) => (
            <button
              key={btn.provider}
              onClick={() => handleSocialLogin(btn.provider)}
              disabled={isLoading}
              className={`
                flex items-center justify-center gap-3
                h-12 w-full rounded-[var(--dream-radius-md)]
                font-semibold text-base
                transition-all duration-[var(--dream-transition-fast)]
                active:scale-[0.97]
                disabled:opacity-[0.4] disabled:pointer-events-none
                ${btn.className}
              `}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[var(--dream-neutral-200)]" />
          <span className="text-sm text-[var(--dream-neutral-400)]">or</span>
          <div className="flex-1 h-px bg-[var(--dream-neutral-200)]" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4 mb-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading
              ? "Loading..."
              : mode === "signup"
                ? "Create Dream ID"
                : "Sign In"}
          </Button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-[var(--dream-color-text-secondary)]">
          {mode === "signin" ? (
            <>
              New to Dream Hub?{" "}
              <button
                onClick={() => { setMode("signup"); setError(null); }}
                className="text-[var(--dream-color-primary)] font-semibold hover:underline"
              >
                Create your Dream ID
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("signin"); setError(null); }}
                className="text-[var(--dream-color-primary)] font-semibold hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </Card>
    </div>
  );
}
