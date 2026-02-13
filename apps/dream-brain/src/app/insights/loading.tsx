export default function InsightsLoading() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 backdrop-blur-xl bg-gray-950/80 border-b border-white/5">
        <div className="h-6 w-32 rounded bg-white/[0.08] animate-pulse" />
        <div className="h-9 w-9 rounded-full bg-white/[0.08] animate-pulse" />
      </div>
      <div className="flex-1 px-5 py-5 flex flex-col gap-5">
        {/* Period toggle skeleton */}
        <div className="flex rounded-xl bg-white/[0.04] p-1">
          <div className="flex-1 h-10 rounded-lg bg-white/[0.08] animate-pulse" />
          <div className="flex-1 h-10 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        {/* Card skeletons */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
          >
            <div className="h-4 w-32 rounded bg-white/[0.08] animate-pulse mb-3" />
            <div className="h-3 w-full rounded bg-white/[0.06] animate-pulse mb-2" />
            <div className="h-3 w-3/4 rounded bg-white/[0.06] animate-pulse mb-2" />
            <div className="h-3 w-1/2 rounded bg-white/[0.06] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
