import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-800">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/planner"
          className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "var(--dream-color-primary, #e11d73)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
