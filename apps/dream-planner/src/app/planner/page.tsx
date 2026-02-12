"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { PART1_ACTIVITIES } from "@/types/planner";

const PARTS = [
  {
    num: 1,
    title: "Face My Reality",
    description: "Assess your skills, resources, time, money, and current state.",
    activities: 5,
    color: "from-purple-500 to-brand-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    href: "/planner/part1",
    available: true,
  },
  {
    num: 2,
    title: "Discover My Dream",
    description: "Explore your experiences, failures, strengths, and find your Why.",
    activities: 5,
    color: "from-brand-500 to-blue-500",
    bgColor: "bg-brand-50 dark:bg-brand-950",
    href: "#",
    available: false,
  },
  {
    num: 3,
    title: "Validate & Build",
    description: "Create a one-line proposal, test hypotheses, build a $0 MVP.",
    activities: 4,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    href: "#",
    available: false,
  },
  {
    num: 4,
    title: "Connect & Expand",
    description: "Find your first 10 fans, build your Dream 5, collect rejections.",
    activities: 6,
    color: "from-cyan-500 to-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    href: "#",
    available: false,
  },
];

export default function DashboardPage() {
  const { data } = usePlannerStore();
  const router = useRouter();

  useEffect(() => {
    if (!data.onboarded) {
      router.replace("/onboarding");
    }
  }, [data.onboarded, router]);

  if (!data.onboarded) return null;

  const part1Progress = Math.round(
    (data.completedActivities.length / 5) * 100
  );
  const overallProgress = Math.round(
    (data.completedActivities.length / 20) * 100
  );

  return (
    <div className="mx-auto max-w-4xl">
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {data.userName ? `Hey, ${data.userName}!` : "Welcome back!"}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {data.streak > 1
            ? `${data.streak}-day streak! Keep the momentum going.`
            : "Your journey to turning dreams into reality starts here."}
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8 rounded-card border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Overall Progress
          </h3>
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {overallProgress}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-blue-500 transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="mt-3 flex gap-6 text-xs text-gray-400">
          <span>
            <strong className="text-gray-600 dark:text-gray-300">
              {data.completedActivities.length}
            </strong>{" "}
            activities completed
          </span>
          {data.streak > 0 && (
            <span>
              <strong className="text-gray-600 dark:text-gray-300">
                {data.streak}
              </strong>{" "}
              day streak
            </span>
          )}
        </div>
      </div>

      {/* Dream Statement */}
      {data.dreamStatement && (
        <div className="mb-8 rounded-card bg-gradient-to-r from-brand-50 to-blue-50 p-5 dark:from-brand-950 dark:to-blue-950">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-500">
            My Dream
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            &ldquo;{data.dreamStatement}&rdquo;
          </p>
        </div>
      )}

      {/* PART Cards */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Your Journey
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {PARTS.map((part) => {
          const progress = part.num === 1 ? part1Progress : 0;
          return (
            <div
              key={part.num}
              className={cn(
                "relative overflow-hidden rounded-card border border-gray-200 bg-white p-6 transition-all dark:border-gray-700 dark:bg-gray-900",
                part.available
                  ? "cursor-pointer hover:shadow-md"
                  : "opacity-60"
              )}
              onClick={() => part.available && router.push(part.href)}
            >
              {/* Part Number Badge */}
              <div
                className={cn(
                  "mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r text-sm font-bold text-white",
                  part.color
                )}
              >
                {part.num}
              </div>

              <h4 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                {part.title}
              </h4>
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                {part.description}
              </p>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                      part.color
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {progress}%
                </span>
              </div>

              {!part.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Action */}
      <div className="mt-8">
        <Link href="/planner/part1">
          <Button size="lg" className="w-full gap-2">
            {data.completedActivities.length > 0
              ? "Continue PART 1"
              : "Start PART 1"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
}
