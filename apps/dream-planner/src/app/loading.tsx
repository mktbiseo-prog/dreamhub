export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 dark:border-gray-700"
          style={{ borderTopColor: "var(--dream-color-primary, #e11d73)" }}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
