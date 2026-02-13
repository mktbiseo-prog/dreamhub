export default function DashboardLoading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-10">
          <div className="h-9 w-72 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Stats skeleton */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-9 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>

        {/* Stories skeleton */}
        <div className="mb-12">
          <div className="mb-6 h-7 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-4 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="mt-4 flex gap-2">
                  <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders skeleton */}
        <div>
          <div className="mb-6 h-7 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
