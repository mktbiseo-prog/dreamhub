import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Messages | Dream Store",
  description: "Your conversations with dreamers and supporters.",
};

export default function MessagesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Messages
      </h1>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
          <svg
            className="h-7 w-7 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No messages yet
        </h2>
        <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          When you connect with dreamers or receive supporter messages, they will
          appear here.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Discover Dreams
        </Link>
      </div>
    </main>
  );
}
