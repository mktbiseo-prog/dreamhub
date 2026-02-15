"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore, type PlannerData } from "@/lib/store";
import { getEarnedBadges, getHighestTitle, BADGE_ICONS } from "@/lib/gamification";
import { VersionHistory } from "@/components/planner/VersionHistory";
import { ProgressRing } from "@/components/planner/ProgressRing";
import { JourneyPath } from "@/components/planner/JourneyPath";
import { WeeklySummary } from "@/components/planner/WeeklySummary";
import { WelcomeBack } from "@/components/planner/WelcomeBack";
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
  return PART2_ACTIVITIES.every((a) => data.part2.completedActivities.includes(a.id));
}

function isPart3Complete(data: { part3: { completedActivities: number[] } }) {
  return PART3_ACTIVITIES.every((a) => data.part3.completedActivities.includes(a.id));
}

const ALL_ACTIVITIES = [...PART1_ACTIVITIES, ...PART2_ACTIVITIES, ...PART3_ACTIVITIES, ...PART4_ACTIVITIES];
const TOTAL_ACTIVITY_COUNT = ALL_ACTIVITIES.length;

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

  if (activePart === 2) {
    if (data.part2.mindMapNodes.length === 0) {
      tips.push({ icon: "lightbulb", text: "Start your mind map! Add experiences that shaped who you are." });
    }
    if (data.part2.failureEntries.length > 0 && data.part2.strengths.length === 0) {
      tips.push({ icon: "star", text: "Great failure list! Now discover your strengths — they're often hidden in those lessons." });
    }
  }

  if (activePart === 3) {
    if (data.part3.hypotheses.filter((h) => h.status === "pending").length > 0) {
      tips.push({ icon: "target", text: "You have untested hypotheses. Test before you build — it's the fastest path to learning." });
    }
  }

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
  { num: 1, title: "Face My Reality", activities: PART1_ACTIVITIES.length, href: "/planner/part1" },
  { num: 2, title: "Discover My Dream", activities: PART2_ACTIVITIES.length, href: "/planner/part2" },
  { num: 3, title: "Validate & Build", activities: PART3_ACTIVITIES.length, href: "/planner/part3" },
  { num: 4, title: "Connect & Expand", activities: PART4_ACTIVITIES.length, href: "/planner/part4" },
];

const PART_COLORS = [
  "var(--dream-part-1)",
  "var(--dream-part-2)",
  "var(--dream-part-3)",
  "var(--dream-part-4)",
];

export default function DashboardPage() {
  const { data } = usePlannerStore();
  const router = useRouter();
  const [milestonePopup, setMilestonePopup] = useState<{ count: number; message: string } | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    if (!data.onboarded) {
      router.replace("/onboarding");
    }
  }, [data.onboarded, router]);

  // Welcome-back detection (2+ days away)
  useEffect(() => {
    if (!data.lastVisitAt) return;
    const shownKey = "dream-planner-welcome-back-shown";
    const lastShown = localStorage.getItem(shownKey);
    const daysSinceVisit = Math.floor(
      (Date.now() - new Date(data.lastVisitAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceVisit >= 2 && lastShown !== data.lastVisitAt) {
      setShowWelcomeBack(true);
      localStorage.setItem(shownKey, data.lastVisitAt);
    }
  }, [data.lastVisitAt]);

  // Milestone celebration detection
  useEffect(() => {
    const total = totalCompleted(data);

    const milestones: Record<number, string> = {
      5: "Quarter way there! PART 1 skills are mapped.",
      10: "Halfway! Your dream is taking shape.",
      15: "Three quarters done! Your idea is validated.",
      [TOTAL_ACTIVITY_COUNT]: "You did it! The entire Dream Planner is complete!",
    };

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
  }, [data.completedActivities, data.part2.completedActivities, data.part3.completedActivities, data.part4.completedActivities, data]);

  if (!data.onboarded) return null;

  const part1Done = isPart1Complete(data);
  const part2Done = isPart2Complete(data);
  const part3Done = isPart3Complete(data);

  const partAvailable = [true, part1Done, part1Done && part2Done, part1Done && part2Done && part3Done];

  const partProgress = [
    Math.round((data.completedActivities.length / PART1_ACTIVITIES.length) * 100),
    Math.round((data.part2.completedActivities.length / PART2_ACTIVITIES.length) * 100),
    Math.round((data.part3.completedActivities.length / PART3_ACTIVITIES.length) * 100),
    Math.round((data.part4.completedActivities.length / PART4_ACTIVITIES.length) * 100),
  ];

  const total = totalCompleted(data);

  const activePart = partAvailable[3] ? 4 : partAvailable[2] ? 3 : partAvailable[1] ? 2 : 1;
  const activeHref = PARTS[activePart - 1].href;
  const activeLabel = total > 0 ? `Continue PART ${activePart}` : "Start PART 1";

  // Weekly activity data
  const activeDays = useMemo(() => {
    const days = Array(7).fill(false);
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    // For simple heuristic: mark today as active if streak > 0
    if (data.streak > 0) {
      const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0
      days[todayIdx] = true;
      // Mark previous days based on streak
      for (let i = 1; i < Math.min(data.streak, 7); i++) {
        const idx = todayIdx - i;
        if (idx >= 0) days[idx] = true;
      }
    }
    return days;
  }, [data.streak]);

  // All completed activities as flat array
  const allCompletedActivities = [
    ...data.completedActivities,
    ...data.part2.completedActivities,
    ...data.part3.completedActivities,
    ...data.part4.completedActivities,
  ];

  return (
    <div>
      {/* Welcome Back Overlay */}
      {showWelcomeBack && (
        <WelcomeBack
          daysAway={data.lastVisitAt ? Math.floor((Date.now() - new Date(data.lastVisitAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
          completedCount={total}
          dreamStatement={data.dreamStatement}
          onContinue={() => setShowWelcomeBack(false)}
        />
      )}

      {/* Milestone Celebration Popup */}
      {milestonePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md animate-in zoom-in-95 fade-in rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-2xl dark:border-amber-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-4xl dark:from-amber-900 dark:to-orange-900">
              {milestonePopup.count === TOTAL_ACTIVITY_COUNT ? "\u{1F680}" : milestonePopup.count >= 15 ? "\u{1F31F}" : milestonePopup.count >= 10 ? "\u{1F525}" : "\u{1F3AF}"}
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
              {milestonePopup.count} Activities Complete!
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {milestonePopup.message}
            </p>
            <div className="mb-4 flex justify-center gap-1">
              {Array.from({ length: TOTAL_ACTIVITY_COUNT }).map((_, i) => (
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
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.userName ? `Hey, ${data.userName}!` : "Welcome back!"}
          </h2>
          {(() => {
            const title = getHighestTitle(data);
            if (!title) return null;
            return (
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: "var(--dream-color-primary)" }}
              >
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
      {data.streak === 1 && data.maxStreak > 2 && total > 3 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-800 dark:from-amber-950 dark:to-orange-950">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-2xl">&#x1F525;</span>
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                Welcome back! Your {data.maxStreak}-day streak ended, but that&apos;s okay.
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Every champion takes breaks. You&apos;ve already completed {total} activities — that momentum doesn&apos;t disappear.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Rings */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Your Progress
        </h3>
        <div className="flex items-center justify-around">
          {PARTS.map((part, i) => (
            <ProgressRing
              key={part.num}
              progress={partProgress[i]}
              size={72}
              strokeWidth={5}
              color={PART_COLORS[i]}
              label={`Part ${part.num}`}
            />
          ))}
        </div>
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-400">
            <strong className="text-gray-600 dark:text-gray-300">{total}</strong> of {TOTAL_ACTIVITY_COUNT} activities completed
          </span>
        </div>
      </div>

      {/* Dream Statement */}
      {data.dreamStatement && (
        <div className="mb-6 rounded-xl p-5" style={{ backgroundColor: "rgba(225, 29, 115, 0.06)" }}>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dream-color-primary)" }}>
            My Dream
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            &ldquo;{data.dreamStatement}&rdquo;
          </p>
        </div>
      )}

      {/* Current Activity CTA */}
      {total > 0 && total < TOTAL_ACTIVITY_COUNT && (
        <div className="mb-6 rounded-xl border-2 p-5 shadow-lg" style={{ borderColor: "var(--dream-color-primary)" }}>
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: PART_COLORS[activePart - 1] }}
            >
              {activePart}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--dream-color-primary)" }}>
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

      {/* Weekly Summary */}
      <WeeklySummary
        activeDays={activeDays}
        activitiesThisWeek={Math.min(total, 7)}
        className="mb-8"
      />

      {/* AI Smart Tips */}
      {(() => {
        const tips = getSmartTips(data, activePart);
        if (tips.length === 0) return null;
        return (
          <div className="mb-8 space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--dream-color-primary)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
              AI Recommendations
            </h3>
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border px-4 py-3" style={{ borderColor: "rgba(225, 29, 115, 0.15)", backgroundColor: "rgba(225, 29, 115, 0.04)" }}>
                <span className="mt-0.5" style={{ color: "var(--dream-color-primary)" }}>{TIP_ICONS[tip.icon]}</span>
                <p className="flex-1 text-xs text-gray-700 dark:text-gray-300">{tip.text}</p>
                {tip.actionLabel && tip.actionHref && (
                  <Link href={tip.actionHref} className="shrink-0 text-xs font-medium hover:underline" style={{ color: "var(--dream-color-primary)" }}>
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
              const typeColors: Record<string, string> = {
                stuck: "border-l-amber-400",
                completion: "border-l-green-400",
                entry: "border-l-blue-400",
                chat: "border-l-rose-400",
              };
              const typeLabels: Record<string, string> = {
                stuck: "Nudge",
                completion: "Completed",
                entry: "New PART",
                chat: "Insight",
              };
              return (
                <div
                  key={insight.id}
                  className={cn(
                    "rounded-lg border-l-[3px] bg-white px-4 py-3 dark:bg-gray-900",
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

      {/* Journey Path */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Your Journey
      </h3>
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <JourneyPath
          partActivities={[PART1_ACTIVITIES, PART2_ACTIVITIES, PART3_ACTIVITIES, PART4_ACTIVITIES]}
          completedActivities={allCompletedActivities}
          currentActivity={
            activePart === 1 ? data.currentActivity :
            activePart === 2 ? data.part2.currentActivity :
            activePart === 3 ? data.part3.currentActivity :
            data.part4.currentActivity
          }
          activePart={activePart}
          partAvailable={partAvailable}
        />
      </div>

      {/* Badges & Achievements */}
      {(() => {
        const badges = getEarnedBadges(data);
        const earned = badges.filter((b) => b.earned);
        const title = getHighestTitle(data);

        if (earned.length === 0 && !title) return null;

        return (
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Achievements
            </h3>

            {title && (
              <div className="mb-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:from-amber-950 dark:to-orange-950">
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

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {badges.map((badge) => {
                const iconInfo = BADGE_ICONS[badge.icon];
                return (
                  <div
                    key={badge.id}
                    className={cn(
                      "group relative flex flex-col items-center rounded-lg p-3 text-center transition-all",
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

      {/* Journey Report */}
      {total >= 5 && (
        <div className="mb-8">
          <Link href="/planner/report">
            <div className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-5 transition-all hover:shadow-md dark:border-rose-800 dark:from-rose-950/50 dark:to-pink-950/50">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--dream-color-primary)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Your Dream Journey Report
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    AI-generated comprehensive analysis of your entire journey.
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: "var(--dream-color-primary)" }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Version History */}
      {data.versionHistory.length > 0 && (
        <div className="mb-8">
          <VersionHistory />
        </div>
      )}

      {/* Quick Action */}
      <div className="flex gap-3">
        <Link href={activeHref} className="flex-1">
          <Button size="lg" className="w-full gap-2">
            {activeLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
}
