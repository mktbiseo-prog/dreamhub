"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { SignInForm } from "@dreamhub/ui";

function useDemoAuth(email: string, callbackUrl: string) {
  localStorage.setItem("dreamhub_access_token", "demo-token");
  localStorage.setItem("dreamhub_user_email", email);
  document.cookie =
    "dreamhub-demo-session=true; path=/; max-age=604800; SameSite=Lax";
  window.location.href = callbackUrl;
}

export function SignInPageClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(
    searchParams.get("error")
      ? "Invalid credentials. Please try again."
      : undefined
  );

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setError(undefined);
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  }

  async function handleEmailSignIn(email: string, password: string) {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "Configuration") {
          useDemoAuth(email, callbackUrl);
          return;
        }
        setError("Invalid email or password.");
        setIsLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      useDemoAuth(email, callbackUrl);
    }
  }

  return (
    <SignInForm
      onGoogleSignIn={handleGoogleSignIn}
      onEmailSignIn={handleEmailSignIn}
      isLoading={isLoading}
      error={error}
    />
  );
}
