"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import { cn } from "@dreamhub/ui";
import { Avatar } from "@dreamhub/design-system";
import { StreakCounter } from "@/components/planner/StreakCounter";
import { usePlannerStore } from "@/lib/store";

// Lazy-load AiCoach — heavy component with AI API calls, not needed at first paint
const AiCoach = dynamic(
  () => import("@/components/planner/AiCoach").then((m) => m.AiCoach),
  { ssr: false },
);

function AvatarMenu({ name, onDashboard }: { name: string; onDashboard: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="dream-press"
      >
        <Avatar size="sm" name={name} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-30 mt-2 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => { onDashboard(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Dashboard
            </button>
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

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

          {/* Right: Streak + Avatar + Menu */}
          <div className="flex items-center gap-3">
            <StreakCounter streak={data.streak} maxStreak={data.maxStreak} />
            <AvatarMenu
              name={data.userName || "Dreamer"}
              onDashboard={() => router.push("/planner")}
            />
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
