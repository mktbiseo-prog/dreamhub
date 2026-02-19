"use client";

import { Button } from "@dreamhub/ui";

interface BatchExhaustedProps {
  onRefresh?: () => void;
}

export function BatchExhausted({ onRefresh }: BatchExhaustedProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[#E8E0FF] bg-[#F5F1FF] px-6 py-12 text-center">
      {/* Clock icon */}
      <svg className="mb-4 h-12 w-12 text-[#6C3CE1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        You&apos;ve reviewed today&apos;s matches
      </h3>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        New curated matches arrive daily. Check back tomorrow for fresh connections!
      </p>
      {onRefresh && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRefresh}>
          Refresh Matches
        </Button>
      )}
    </div>
  );
}
