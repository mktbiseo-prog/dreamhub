"use client";

import { Button } from "@dreamhub/ui";

interface BatchExhaustedProps {
  onRefresh?: () => void;
}

export function BatchExhausted({ onRefresh }: BatchExhaustedProps) {
  return (
    <div className="flex flex-col items-center rounded-[16px] border border-blue-100 bg-blue-50/50 px-6 py-12 text-center dark:border-blue-900/30 dark:bg-blue-950/20">
      {/* Clock icon */}
      <svg className="mb-4 h-12 w-12 text-blue-400 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        You&apos;ve reviewed today&apos;s matches
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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
