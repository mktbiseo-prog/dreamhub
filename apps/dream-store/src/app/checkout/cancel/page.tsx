import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@dreamhub/ui";

export const metadata: Metadata = {
  title: "Checkout Cancelled | Dream Store",
};

interface PageProps {
  searchParams: Promise<{ story_id?: string; product_id?: string }>;
}

export default async function CheckoutCancelPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const backUrl =
    params.story_id && params.product_id
      ? `/stories/${params.story_id}/products/${params.product_id}`
      : "/";

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <svg
            className="h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          Checkout Cancelled
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          No worries! The dream is still here whenever you&apos;re ready to
          support it.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={backUrl}>
            <Button size="lg" className="w-full sm:w-auto">
              Go Back to Product
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Discover Dreams
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
