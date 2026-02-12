import Link from "next/link";
import { Button } from "@dreamhub/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-blue-500">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="bg-gradient-to-r from-brand-500 to-blue-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            Dream Planner
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-gray-600 dark:text-gray-400">
            Turn your dreams into action with a guided 4-step journey. AI coaching
            included.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/onboarding">
            <Button size="lg" className="gap-2">
              Start for Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
          <Link href="/planner">
            <Button variant="outline" size="lg">
              I Already Started
            </Button>
          </Link>
        </div>

        {/* Feature chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            "AI-Guided Coaching",
            "4-Step Framework",
            "$0 to Start",
            "Auto-Save Progress",
            "Interactive Charts",
          ].map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center dark:border-gray-800">
        <p className="text-xs text-gray-400">
          Dream Planner by Dream Hub &middot; Inspired by Simon Squibb
        </p>
      </footer>
    </main>
  );
}
