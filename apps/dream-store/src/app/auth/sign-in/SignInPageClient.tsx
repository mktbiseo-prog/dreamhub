"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { SignInForm } from "@dreamhub/ui";

export function SignInPageClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(
    searchParams.get("error") ? "Invalid credentials. Please try again." : undefined
  );

  async function handleGoogleSignIn() {
    setIsLoading(true);
    await signIn("google", { callbackUrl });
  }

  async function handleEmailSignIn(email: string, password: string) {
    setIsLoading(true);
    setError(undefined);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setIsLoading(false);
    } else {
      window.location.href = callbackUrl;
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
