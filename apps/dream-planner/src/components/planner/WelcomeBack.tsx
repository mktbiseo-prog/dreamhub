"use client";

import { Button } from "@dreamhub/design-system";

interface WelcomeBackProps {
  daysAway: number;
  completedCount: number;
  dreamStatement: string;
  onContinue: () => void;
}

export function WelcomeBack({
  daysAway,
  completedCount,
  dreamStatement,
  onContinue,
}: WelcomeBackProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md animate-in zoom-in-95 fade-in rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-2xl dark:border-rose-800/40 dark:bg-gray-900">
        {/* Welcome icon */}
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 text-4xl dark:from-rose-900/40 dark:to-pink-900/40">
          &#x1F44B;
        </div>

        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back!
        </h2>

        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {completedCount > 0
            ? `You've already completed ${completedCount} ${completedCount === 1 ? "activity" : "activities"}. That momentum doesn't disappear.`
            : "Your dream is still waiting for you. Let's pick up where you left off."}
        </p>

        {dreamStatement && (
          <div className="mb-6 rounded-xl bg-rose-50 px-4 py-3 dark:bg-rose-950/30">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-500">
              Your Dream
            </p>
            <p className="mt-1 text-sm italic text-gray-700 dark:text-gray-300">
              &ldquo;{dreamStatement}&rdquo;
            </p>
          </div>
        )}

        <Button onClick={onContinue} className="w-full">
          Pick up where you left off
        </Button>
      </div>
    </div>
  );
}
