export default function HomeLoading() {
  return (
    <main className="min-h-screen">
      {/* Hero skeleton */}
      <div className="animate-pulse bg-gray-200 px-4 py-20 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto h-12 w-96 max-w-full rounded bg-gray-300 dark:bg-gray-700" />
          <div className="mx-auto mt-4 h-6 w-80 max-w-full rounded bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-card border border-gray-200 dark:border-gray-800"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
