export default function StoryLoading() {
  return (
    <main className="min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[50vh] min-h-[400px] bg-gray-200 dark:bg-gray-800" />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Statement */}
        <div className="mb-12 space-y-3">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-5 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-5 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-5 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Progress bar */}
        <div className="mb-12 rounded-card bg-gray-100 p-6 dark:bg-gray-900">
          <div className="mb-2 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Timeline */}
        <div className="mb-16 space-y-6">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>

        {/* Products */}
        <div className="mb-16">
          <div className="mb-6 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-card border border-gray-200 dark:border-gray-800"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="flex justify-between">
                    <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-8 w-36 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
