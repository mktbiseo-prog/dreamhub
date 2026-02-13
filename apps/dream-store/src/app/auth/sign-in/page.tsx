import type { Metadata } from "next";
import { SignInPageClient } from "./SignInPageClient";

export const metadata: Metadata = {
  title: "Sign In | Dream Store",
  description: "Sign in to your Dream Hub account.",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <SignInPageClient />
    </main>
  );
}
