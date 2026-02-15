"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "var(--dream-color-primary, #e11d73)" }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
