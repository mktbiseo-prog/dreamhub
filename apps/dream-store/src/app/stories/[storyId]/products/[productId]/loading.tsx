export default function ProductLoading() {
  return (
    <main className="min-h-screen animate-pulse">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex gap-2">
          <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="aspect-square rounded-card bg-gray-200 dark:bg-gray-800" />

          {/* Info */}
          <div className="space-y-6">
            {/* Dream context */}
            <div className="flex items-center gap-3 rounded-card bg-gray-100 p-4 dark:bg-gray-900">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-1">
                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* Title */}
            <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            {/* Price */}
            <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            {/* CTA */}
            <div className="h-14 w-full rounded-[8px] bg-gray-200 dark:bg-gray-700" />

            {/* Description */}
            <div className="space-y-2 border-t border-gray-200 pt-8 dark:border-gray-800">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Why I Made This */}
            <div className="space-y-2 rounded-card bg-gray-100 p-5 dark:bg-gray-900">
              <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
