"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@dreamhub/ui";
import { Avatar } from "@dreamhub/design-system";
import { AiCoach } from "@/components/planner/AiCoach";
import { StreakCounter } from "@/components/planner/StreakCounter";
import { usePlannerStore } from "@/lib/store";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = usePlannerStore();

  // Check if current page is an activity page (part1-4)
  const isActivityPage = /\/planner\/part[1-4]/.test(pathname);

  // Determine current Part number for activity pages
  const currentPartMatch = pathname.match(/\/planner\/part(\d)/);
  const currentPartNum = currentPartMatch ? Number(currentPartMatch[1]) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Bar (56px) */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Left: Logo */}
          <Link href="/planner" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--dream-color-primary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <h1 className="text-lg font-bold" style={{ color: "var(--dream-color-primary)" }}>
              Dream Planner
            </h1>
          </Link>

          {/* Center: Part indicator (activity pages only) */}
          {isActivityPage && currentPartNum > 0 && (
            <div className="hidden items-center gap-1.5 sm:flex">
              {[1, 2, 3, 4].map((p) => (
                <div
                  key={p}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-colors",
                    p === currentPartNum
                      ? ""
                      : p < currentPartNum
                        ? "opacity-40"
                        : "bg-gray-200 dark:bg-gray-700",
                  )}
                  style={{
                    backgroundColor: p <= currentPartNum ? `var(--dream-part-${p})` : undefined,
                  }}
                />
              ))}
            </div>
          )}

          {/* Right: Streak + Avatar */}
          <div className="flex items-center gap-3">
            <StreakCounter streak={data.streak} maxStreak={data.maxStreak} />
            <button
              type="button"
              onClick={() => router.push("/planner")}
              className="dream-press"
            >
              <Avatar
                size="sm"
                name={data.userName || "Dreamer"}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Content — 70/30 split on activity pages (desktop) */}
      {isActivityPage ? (
        <div className="mx-auto flex max-w-7xl gap-0 px-4 py-6 sm:px-6 sm:py-10">
          {/* 70% Work Area */}
          <main className="min-w-0 flex-1 xl:pr-6">{children}</main>
          {/* 30% AI Coach Panel — desktop only */}
          <aside className="hidden w-[340px] shrink-0 xl:block">
            <div className="sticky top-20">
              <AiCoach inline />
            </div>
          </aside>
        </div>
      ) : (
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      )}

      {/* Floating AI Coach — mobile / non-activity pages */}
      {isActivityPage ? (
        <div className="xl:hidden">
          <AiCoach />
        </div>
      ) : (
        <AiCoach />
      )}
    </div>
  );
}
