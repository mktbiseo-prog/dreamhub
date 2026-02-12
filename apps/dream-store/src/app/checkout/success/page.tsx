import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@dreamhub/ui";

export const metadata: Metadata = {
  title: "Thank You! | Dream Store",
  description: "Your support means the world.",
};

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-orange-400">
          <svg
            className="h-10 w-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
          You&apos;re a Dream Supporter!
        </h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          Thank you for supporting this dream. Your purchase directly helps a
          creator move closer to their goal. You&apos;re now part of their
          story.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              Discover More Dreams
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View My Supported Dreams
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
