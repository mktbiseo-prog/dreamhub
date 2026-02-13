"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@dreamhub/ui";
import { AiCoach } from "@/components/planner/AiCoach";
import { usePlannerStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/planner", label: "Dashboard" },
  { href: "/planner/part1", label: "PART 1", part: 1 },
  { href: "/planner/part2", label: "PART 2", part: 2 },
  { href: "/planner/part3", label: "PART 3", part: 3 },
  { href: "/planner/part4", label: "PART 4", part: 4 },
];

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data } = usePlannerStore();

  const part1Done = [1, 2, 3, 4, 5].every((id) =>
    data.completedActivities.includes(id)
  ) && data.reflectionAnswers.some((a) => a.trim().length > 0);
  const part2Done = [6, 7, 8, 9, 10].every((id) =>
    data.part2.completedActivities.includes(id)
  );
  const part3Done = [11, 12, 13, 14].every((id) =>
    data.part3.completedActivities.includes(id)
  );

  const partAvailable: Record<number, boolean> = {
    1: true,
    2: part1Done,
    3: part1Done && part2Done,
    4: part1Done && part2Done && part3Done,
  };

  // Dark mode toggle
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("dream-planner-dark");
    const isDark = stored ? stored === "true" : document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("dream-planner-dark", String(next));
  };

  // Notification count (coach insights not yet seen)
  const insightCount = data.recentInsights.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/planner">
              <h1 className="bg-gradient-to-r from-brand-500 to-blue-500 bg-clip-text text-lg font-bold text-transparent">
                Dream Planner
              </h1>
            </Link>
          </div>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDark}
              className="mr-1 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              )}
            </button>
            {/* Notification Bell */}
            <Link
              href="/planner"
              className="relative mr-1 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title="Dashboard"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
              {insightCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">{Math.min(insightCount, 9)}</span>
              )}
            </Link>
            <div className="mr-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/planner"
                  ? pathname === "/planner"
                  : pathname.startsWith(item.href);
              const locked = item.part ? !partAvailable[item.part] : false;

              return (
                <Link
                  key={item.href}
                  href={locked ? "#" : item.href}
                  onClick={(e) => locked && e.preventDefault()}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : locked
                        ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  )}
                >
                  {locked && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>

      {/* AI Coach */}
      <AiCoach />
    </div>
  );
}
