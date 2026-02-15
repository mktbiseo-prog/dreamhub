import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInPageClient } from "./SignInPageClient";

export const metadata: Metadata = {
  title: "Sign In | Dream Planner",
  description: "Sign in to your Dream Hub account.",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <SignInPageClient />
      </Suspense>
    </main>
  );
}
