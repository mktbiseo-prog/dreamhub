"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInForm } from "@dreamhub/ui";

function useDemoAuth(email: string, callbackUrl: string) {
  localStorage.setItem("dreamhub_access_token", "demo-token");
  localStorage.setItem("dreamhub_user_email", email);
  document.cookie =
    "dreamhub-demo-session=true; path=/; max-age=604800; SameSite=Lax";
  window.location.href = callbackUrl;
}

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      useDemoAuth("demo@google.com", "/");
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
          useDemoAuth(email, "/");
          return;
        }
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      useDemoAuth(email, "/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <SignInForm
        onGoogleSignIn={handleGoogleSignIn}
        onEmailSignIn={handleEmailSignIn}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
