"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore, type PlannerData } from "@/lib/store";
import { getEarnedBadges, getHighestTitle, BADGE_ICONS } from "@/lib/gamification";
import { ExportButton } from "@/components/planner/ExportButton";
import { VersionHistory } from "@/components/planner/VersionHistory";
import { PART1_ACTIVITIES } from "@/types/planner";
import { PART2_ACTIVITIES } from "@/types/part2";
import { PART3_ACTIVITIES } from "@/types/part3";
import { PART4_ACTIVITIES } from "@/types/part4";

function isPart1Complete(data: { completedActivities: number[]; reflectionAnswers: string[] }) {
  const has5 = [1, 2, 3, 4, 5].every((id) => data.completedActivities.includes(id));
  const hasReflection = data.reflectionAnswers.some((a) => a.trim().length > 0);
  return has5 && hasReflection;
}

function isPart2Complete(data: { part2: { completedActivities: number[] } }) {
  return [6, 7, 8, 9, 10].every((id) => data.part2.completedActivities.includes(id));
}

function isPart3Complete(data: { part3: { completedActivities: number[] } }) {
  return [11, 12, 13, 14].every((id) => data.part3.completedActivities.includes(id));
}

const ALL_ACTIVITIES = [...PART1_ACTIVITIES, ...PART2_ACTIVITIES, ...PART3_ACTIVITIES, ...PART4_ACTIVITIES];

function getCurrentActivityName(
  activePart: number,
  data: { currentActivity: number; part2: { currentActivity: number }; part3: { currentActivity: number }; part4: { currentActivity: number } }
): string {
  const actId =
    activePart === 1 ? data.currentActivity :
    activePart === 2 ? data.part2.currentActivity :
    activePart === 3 ? data.part3.currentActivity :
    data.part4.currentActivity;

  if (actId === 0) return "Reflection";
  return ALL_ACTIVITIES.find((a) => a.id === actId)?.title || `Activity ${actId}`;
}

interface SmartTip {
  icon: "lightbulb" | "clock" | "chart" | "star" | "target";
  text: string;
  actionLabel?: string;
  actionHref?: string;
}

function getSmartTips(data: PlannerData, activePart: number): SmartTip[] {
  const tips: SmartTip[] = [];

  // PART 1 tips
  if (activePart === 1) {
    if (data.skills.length === 0) {
      tips.push({ icon: "lightbulb", text: "Start by listing your skills. Include things people ask you for help with!", actionLabel: "Add Skills", actionHref: "/planner/part1" });
    } else if (data.skills.length < 5) {
      tips.push({ icon: "lightbulb", text: `You've listed ${data.skills.length} skills. Try to reach at least 10 — include hobbies and soft skills too.` });
    }
    if (data.timeBlocks.length === 0 && data.completedActivities.includes(1)) {
      tips.push({ icon: "clock", text: "Log your time for a typical day. The patterns will surprise you.", actionLabel: "Log Time", actionHref: "/planner/part1" });
    }
    if (data.expenses.length > 0) {
      const lowSat = data.expenses.filter((e) => e.satisfaction === "low");
      if (lowSat.length >= 3) {
        tips.push({ icon: "chart", text: `${lowSat.length} expenses scored low satisfaction. That gap between spending and happiness is where your dream funding hides.` });
      }
    }
    const weakResources = data.resources.filter((r) => r.score <= 2 && r.score > 0);
    if (weakResources.length > 0) {
      tips.push({ icon: "target", text: `Your weakest resource: ${weakResources[0].label}. Consider finding a partner who's strong there.` });
    }
  }

  // PART 2 tips
  if (activePart === 2) {
    if (data.part2.mindMapNodes.length === 0) {
      tips.push({ icon: "lightbulb", text: "Start your mind map! Add experiences that shaped who you are." });
    }
    if (data.part2.failureEntries.length > 0 && data.part2.strengths.length === 0) {
      tips.push({ icon: "star", text: "Great failure list! Now discover your strengths — they're often hidden in those lessons." });
    }
  }

  // PART 3 tips
  if (activePart === 3) {
    if (data.part3.hypotheses.filter((h) => h.status === "pending").length > 0) {
      tips.push({ icon: "target", text: "You have untested hypotheses. Test before you build — it's the fastest path to learning." });
    }
  }

  // PART 4 tips
  if (activePart === 4) {
    const fans = data.part4.fanCandidates;
    if (fans.length > 0 && fans.filter((f) => f.stage === "fan").length === 0) {
      tips.push({ icon: "star", text: "You have candidates but no fans yet. Provide value first — that's how fans are made." });
    }
  }

  // Streak tips
  if (data.streak >= 7) {
    tips.push({ icon: "star", text: `${data.streak}-day streak! Consistency is your superpower. Keep it up!` });
  } else if (data.streak === 1 && totalCompleted(data) > 3) {
    tips.push({ icon: "clock", text: "Come back tomorrow to build your streak. Daily consistency compounds." });
  }

  return tips.slice(0, 3);
}

function totalCompleted(data: PlannerData): number {
  return data.completedActivities.length + data.part2.completedActivities.length + data.part3.completedActivities.length + data.part4.completedActivities.length;
}

const TIP_ICONS: Record<string, React.ReactNode> = {
  lightbulb: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  chart: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  target: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
};

const PARTS = [
  {
    num: 1,
    title: "Face My Reality",
    description: "Assess your skills, resources, time, money, and current state.",
    activities: 5,
    color: "from-purple-500 to-brand-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    href: "/planner/part1",
  },
  {
    num: 2,
    title: "Discover My Dream",
    description: "Explore your experiences, failures, strengths, and find your Why.",
    activities: 5,
    color: "from-brand-500 to-blue-500",
    bgColor: "bg-brand-50 dark:bg-brand-950",
    href: "/planner/part2",
  },
  {
    num: 3,
    title: "Validate & Build",
    description: "Create a one-line proposal, test hypotheses, build a $0 MVP.",
    activities: 4,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    href: "/planner/part3",
  },
  {
    num: 4,
    title: "Connect & Expand",
    description: "Find your first 10 fans, build your Dream 5, collect rejections.",
    activities: 6,
    color: "from-cyan-500 to-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    href: "/planner/part4",
  },
];

export default function DashboardPage() {
  const { data } = usePlannerStore();
  const router = useRouter();
  const [milestonePopup, setMilestonePopup] = useState<{ count: number; message: string } | null>(null);

  useEffect(() => {
    if (!data.onboarded) {
      router.replace("/onboarding");
    }
  }, [data.onboarded, router]);

  // Milestone celebration detection
  useEffect(() => {
    const total =
      data.completedActivities.length +
      data.part2.completedActivities.length +
      data.part3.completedActivities.length +
      data.part4.completedActivities.length;

    const milestones: Record<number, string> = {
      5: "Quarter way there! PART 1 skills are mapped.",
      10: "Halfway! Your dream is taking shape.",
      15: "Three quarters done! Your idea is validated.",
      20: "You did it! The entire Dream Planner is complete!",
    };

    // Check localStorage to avoid re-showing
    const shownKey = "dream-planner-milestones-shown";
    const shown: number[] = JSON.parse(localStorage.getItem(shownKey) || "[]");

    for (const [count, message] of Object.entries(milestones)) {
      const n = Number(count);
      if (total >= n && !shown.includes(n)) {
        setMilestonePopup({ count: n, message });
        localStorage.setItem(shownKey, JSON.stringify([...shown, n]));
        break;
      }
    }
  }, [data.completedActivities, data.part2.completedActivities, data.part3.completedActivities, data.part4.completedActivities]);

  if (!data.onboarded) return null;

  const part1Done = isPart1Complete(data);
  const part2Done = isPart2Complete(data);
  const part3Done = isPart3Complete(data);

  const partAvailable = [
    true,
    part1Done,
    part1Done && part2Done,
    part1Done && part2Done && part3Done,
  ];

  const partProgress = [
    Math.round((data.completedActivities.length / 5) * 100),
    Math.round((data.part2.completedActivities.length / 5) * 100),
    Math.round((data.part3.completedActivities.length / 4) * 100),
    Math.round((data.part4.completedActivities.length / 6) * 100),
  ];

  const totalCompleted =
    data.completedActivities.length +
    data.part2.completedActivities.length +
    data.part3.completedActivities.length +
    data.part4.completedActivities.length;
  const overallProgress = Math.round((totalCompleted / 20) * 100);

  // Determine the active CTA
  const activePart = partAvailable[3]
    ? 4
    : partAvailable[2]
      ? 3
      : partAvailable[1]
        ? 2
        : 1;
  const activeHref = PARTS[activePart - 1].href;
  const activeLabel =
    totalCompleted > 0
      ? `Continue PART ${activePart}`
      : "Start PART 1";

  return (
    <div className="mx-auto max-w-4xl">
      {/* Milestone Celebration Popup */}
      {milestonePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md animate-in zoom-in-95 fade-in rounded-[16px] border border-amber-200 bg-white p-8 text-center shadow-2xl dark:border-amber-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-4xl dark:from-amber-900 dark:to-orange-900">
              {milestonePopup.count === 20 ? "\u{1F680}" : milestonePopup.count >= 15 ? "\u{1F31F}" : milestonePopup.count >= 10 ? "\u{1F525}" : "\u{1F3AF}"}
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
              {milestonePopup.count} Activities Complete!
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {milestonePopup.message}
            </p>
            <div className="mb-4 flex justify-center gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    i < milestonePopup.count ? "bg-amber-400" : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>
            <Button onClick={() => setMilestonePopup(null)} className="w-full">
              Keep Going!
            </Button>
          </div>
        </div>
      )}

      {/* Greeting */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.userName ? `Hey, ${data.userName}!` : "Welcome back!"}
          </h2>
          {(() => {
            const title = getHighestTitle(data);
            if (!title) return null;
            return (
              <span className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:from-amber-900 dark:to-orange-900 dark:text-amber-300">
                {title.title}
              </span>
            );
          })()}
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {data.streak > 1
            ? `${data.streak}-day streak! Keep the momentum going.`
            : "Your journey to turning dreams into reality starts here."}
        </p>
      </div>

      {/* Streak Break Encouragement */}
      {data.streak === 1 && data.maxStreak > 2 && totalCompleted > 3 && (
        <div className="mb-6 rounded-card border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-800 dark:from-amber-950 dark:to-orange-950">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-2xl">&#x1F525;</span>
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                Welcome back! Your {data.maxStreak}-day streak ended, but that&apos;s okay.
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Every champion takes breaks. You&apos;ve already completed {totalCompleted} activities — that momentum doesn&apos;t disappear.
                Come back tomorrow to start a new streak!
              </p>
            </div>
          </div>
        </div>
      )}

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
              {totalCompleted}
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

      {/* AI Smart Tips */}
      {(() => {
        const tips = getSmartTips(data, activePart);
        if (tips.length === 0) return null;
        return (
          <div className="mb-8 space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
              AI Recommendations
            </h3>
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-[8px] border border-brand-100 bg-brand-50/50 px-4 py-3 dark:border-brand-900 dark:bg-brand-950/50">
                <span className="mt-0.5 text-brand-500">{TIP_ICONS[tip.icon]}</span>
                <p className="flex-1 text-xs text-gray-700 dark:text-gray-300">{tip.text}</p>
                {tip.actionLabel && tip.actionHref && (
                  <Link href={tip.actionHref} className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    {tip.actionLabel} &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Recent AI Insights */}
      {data.recentInsights.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Recent Coach Insights
          </h3>
          <div className="space-y-2">
            {data.recentInsights.slice(0, 3).map((insight) => {
              const typeColors = {
                stuck: "border-l-amber-400",
                completion: "border-l-green-400",
                entry: "border-l-blue-400",
                chat: "border-l-brand-400",
              };
              const typeLabels = {
                stuck: "Nudge",
                completion: "Completed",
                entry: "New PART",
                chat: "Insight",
              };
              return (
                <div
                  key={insight.id}
                  className={cn(
                    "rounded-[8px] border-l-[3px] bg-white px-4 py-3 dark:bg-gray-900",
                    typeColors[insight.type]
                  )}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase text-gray-400">
                      {typeLabels[insight.type]}
                    </span>
                    <span className="text-[10px] text-gray-300 dark:text-gray-600">
                      {insight.activityName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {insight.message.length > 120 ? insight.message.slice(0, 117) + "..." : insight.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Currently Working On */}
      {totalCompleted > 0 && totalCompleted < 20 && (
        <div className="mb-8 rounded-card border border-brand-200 bg-white p-5 dark:border-brand-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r text-sm font-bold text-white", PARTS[activePart - 1].color)}>
              {activePart}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">
                Continue Where You Left Off
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {getCurrentActivityName(activePart, data)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PART {activePart}: {PARTS[activePart - 1].title}
              </p>
            </div>
            <Link href={activeHref}>
              <Button size="sm" className="gap-1.5">
                Resume
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Mountain Journey Map */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Your Journey
      </h3>
      <div className="mb-6 overflow-hidden rounded-card border border-gray-200 bg-gradient-to-b from-sky-50 to-white p-4 dark:border-gray-700 dark:from-gray-900 dark:to-gray-900">
        <div className="relative mx-auto" style={{ width: "100%", height: 180 }}>
          {/* Mountain SVG */}
          <svg viewBox="0 0 800 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            {/* Mountain silhouette */}
            <path
              d="M0,150 L40,130 L100,110 L160,90 L200,85 L260,65 L320,55 L380,45 L420,50 L480,35 L540,25 L580,30 L640,15 L700,8 L760,5 L800,10 L800,160 L0,160 Z"
              className="fill-gray-100 dark:fill-gray-800"
            />
            {/* Trail path */}
            <path
              d="M20,140 C60,125 80,118 120,105 C160,92 180,88 220,80 C260,72 280,63 320,55 C360,47 380,48 420,42 C460,36 480,33 520,28 C560,23 580,26 620,20 C660,14 680,12 720,8 C740,6 760,5 780,6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="text-gray-300 dark:text-gray-600"
            />
          </svg>

          {/* Activity markers along the mountain path */}
          {(() => {
            const allActivities = [...PART1_ACTIVITIES, ...PART2_ACTIVITIES, ...PART3_ACTIVITIES, ...PART4_ACTIVITIES];
            // Coordinates along the mountain trail (x%, y%)
            const positions = [
              [5, 82], [10.5, 76], [16, 68], [21.5, 60], [27, 55],   // PART 1: 1-5
              [33, 46], [38.5, 41], [44, 37], [49.5, 34], [55, 30],   // PART 2: 6-10
              [61, 24], [66.5, 20], [72, 17], [77, 15],                // PART 3: 11-14
              [82, 11], [85.5, 9], [89, 7], [92, 5.5], [95, 4.5], [98, 4], // PART 4: 15-20
            ];
            const partFills = ["#a855f7", "#8b5cf6", "#3b82f6", "#10b981"];
            const partStrokes = ["#9333ea", "#7c3aed", "#2563eb", "#059669"];

            return allActivities.map((a, i) => {
              const partNum = a.id <= 5 ? 1 : a.id <= 10 ? 2 : a.id <= 14 ? 3 : 4;
              const isCompleted = partNum === 1
                ? data.completedActivities.includes(a.id)
                : partNum === 2
                  ? data.part2.completedActivities.includes(a.id)
                  : partNum === 3
                    ? data.part3.completedActivities.includes(a.id)
                    : data.part4.completedActivities.includes(a.id);
              const isCurrent = (partNum === activePart) && (
                partNum === 1 ? data.currentActivity === a.id :
                partNum === 2 ? data.part2.currentActivity === a.id :
                partNum === 3 ? data.part3.currentActivity === a.id :
                data.part4.currentActivity === a.id
              );
              const [xPct, yPct] = positions[i];

              return (
                <div
                  key={a.id}
                  className="group absolute"
                  style={{
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold transition-all",
                      isCompleted
                        ? "text-white shadow-sm"
                        : isCurrent
                          ? "ring-2 ring-brand-500 ring-offset-1 bg-white text-brand-700 dark:ring-offset-gray-900 dark:bg-gray-800"
                          : "bg-white/80 text-gray-400 dark:bg-gray-800/80"
                    )}
                    style={isCompleted ? { backgroundColor: partFills[partNum - 1], borderColor: partStrokes[partNum - 1] } : undefined}
                  >
                    {isCompleted ? "\u2713" : a.id}
                  </div>
                  {/* Flag for current activity */}
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-500" />
                    </div>
                  )}
                  {/* Tooltip */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-0.5 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                    {a.shortTitle}
                  </div>
                </div>
              );
            });
          })()}

          {/* Summit flag */}
          <div className="absolute" style={{ right: "0%", top: "1%", transform: "translate(-50%, -50%)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={totalCompleted === 20 ? "text-amber-500" : "text-gray-300 dark:text-gray-600"}>
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </div>

          {/* PART labels */}
          <div className="absolute bottom-1 left-[15%] text-[8px] font-semibold text-purple-400">PART 1</div>
          <div className="absolute bottom-1 left-[42%] text-[8px] font-semibold text-brand-400">PART 2</div>
          <div className="absolute bottom-1 left-[66%] text-[8px] font-semibold text-blue-400">PART 3</div>
          <div className="absolute bottom-1 left-[88%] text-[8px] font-semibold text-emerald-400">PART 4</div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {PARTS.map((part, i) => {
          const available = partAvailable[i];
          const progress = partProgress[i];
          return (
            <div
              key={part.num}
              className={cn(
                "relative overflow-hidden rounded-card border border-gray-200 bg-white p-6 transition-all dark:border-gray-700 dark:bg-gray-900",
                available
                  ? "cursor-pointer hover:shadow-md"
                  : "opacity-60"
              )}
              onClick={() => available && router.push(part.href)}
            >
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

              {!available && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/60">
                  <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Complete PART {part.num - 1} first
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Badges & Achievements */}
      {(() => {
        const badges = getEarnedBadges(data);
        const earned = badges.filter((b) => b.earned);
        const title = getHighestTitle(data);

        if (earned.length === 0 && !title) return null;

        return (
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Achievements
            </h3>

            {/* Current Title */}
            {title && (
              <div className="mb-4 rounded-card bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:from-amber-950 dark:to-orange-950">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Current Title
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {title.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {title.subtitle}
                </p>
              </div>
            )}

            {/* Badge Grid */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {badges.map((badge) => {
                const iconInfo = BADGE_ICONS[badge.icon];
                return (
                  <div
                    key={badge.id}
                    className={cn(
                      "group relative flex flex-col items-center rounded-[8px] p-3 text-center transition-all",
                      badge.earned
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 opacity-40 grayscale dark:bg-gray-800"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-lg",
                        badge.earned ? iconInfo.color : "from-gray-300 to-gray-400"
                      )}
                    >
                      <span>{iconInfo.emoji}</span>
                    </div>
                    <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                      {badge.label}
                    </p>
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                      {badge.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Before & After Comparison */}
      {data.dreamStatement && totalCompleted >= 15 && (() => {
        const proposal = data.part3.oneLineProposal.finalProposal;
        const fans = data.part4.fanCandidates.filter((f) => f.stage === "fan").length;
        const validated = data.part3.hypotheses.filter((h) => h.status === "success").length;

        return (
          <div className="mt-8 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 via-white to-blue-50 p-6 dark:border-brand-800 dark:from-brand-950 dark:via-gray-900 dark:to-blue-950">
            <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Before & After
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[8px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Day 1 — Your Dream</p>
                <p className="text-sm italic text-gray-600 dark:text-gray-400">&ldquo;{data.dreamStatement}&rdquo;</p>
              </div>
              <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Today — Your Reality</p>
                <div className="space-y-1.5">
                  {proposal && <p className="text-xs text-gray-700 dark:text-gray-300">Proposal: {proposal.slice(0, 80)}{proposal.length > 80 ? "..." : ""}</p>}
                  <p className="text-xs text-gray-700 dark:text-gray-300">{validated} hypotheses validated, {fans} fans acquired</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{data.skills.length} skills mapped, {totalCompleted}/20 activities done</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Journey Report */}
      {totalCompleted >= 5 && (
        <div className="mt-8">
          <Link href="/planner/report">
            <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-5 transition-all hover:shadow-md dark:border-purple-800 dark:from-purple-950/50 dark:to-blue-950/50">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Your Dream Journey Report
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    AI-generated comprehensive analysis of your entire journey across all 4 PARTs.
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-purple-400">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Growth Timeline / Version History */}
      {data.versionHistory.length > 0 && (
        <div className="mt-8">
          <VersionHistory />
        </div>
      )}

      {/* Quick Action */}
      <div className="mt-8 flex gap-3">
        <Link href={activeHref} className="flex-1">
          <Button size="lg" className="w-full gap-2">
            {activeLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
        {totalCompleted > 0 && (
          <ExportButton className="shrink-0" />
        )}
      </div>
    </div>
  );
}
