"use client";

import { usePlannerStore } from "@/lib/store";
import { PART3_ACTIVITIES } from "@/types/part3";
import { ActivitySidebar } from "./ActivitySidebar";
import { AiInsightPanel } from "./AiInsightPanel";
import { OneLineProposal } from "@/components/activities/part3/OneLineProposal";
import { HypothesisBoard } from "@/components/activities/part3/HypothesisBoard";
import { ZeroCostMvp } from "@/components/activities/part3/ZeroCostMvp";
import { ValueLadder } from "@/components/activities/part3/ValueLadder";
import { Part3Reflection } from "@/components/activities/part3/Part3Reflection";
import { CrossPartReference } from "./CrossPartReference";
import { RevenueCalculator } from "@/components/planner/RevenueCalculator";
import { GrowthDashboard } from "@/components/planner/GrowthDashboard";

const PART_COLOR = "var(--dream-part-3)";

export function Part3Shell() {
  const { data, store } = usePlannerStore();
  const p3 = data.part3;
  const completedSet = new Set(p3.completedActivities);

  const handleNext = () => {
    if (!p3.completedActivities.includes(p3.currentActivity)) {
      const meta = PART3_ACTIVITIES.find((a) => a.id === p3.currentActivity);
      store.setPart3Data({
        completedActivities: [...p3.completedActivities, p3.currentActivity],
      });
      store.createSnapshot(meta ? `Completed: ${meta.title}` : `Completed Activity ${p3.currentActivity}`);
    }
    const idx = PART3_ACTIVITIES.findIndex((a) => a.id === p3.currentActivity);
    if (idx < PART3_ACTIVITIES.length - 1) {
      store.setPart3Data({ currentActivity: PART3_ACTIVITIES[idx + 1].id });
    } else {
      store.setPart3Data({ currentActivity: 0 });
    }
  };

  const handleSelect = (id: number) => {
    store.setPart3Data({ currentActivity: id });
  };

  const currentActivityMeta = PART3_ACTIVITIES.find((a) => a.id === p3.currentActivity);

  return (
    <div>
      {/* Part color bar */}
      <div className="mb-6 h-1 w-full rounded-full" style={{ backgroundColor: PART_COLOR }} />

      {/* Instruction card */}
      {currentActivityMeta && p3.currentActivity > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 dark:border-cyan-900/30 dark:bg-cyan-950/20">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: PART_COLOR }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: PART_COLOR }}>Dream Coach</p>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              {currentActivityMeta.description}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <ActivitySidebar
            activities={PART3_ACTIVITIES}
            currentActivity={p3.currentActivity}
            onSelect={handleSelect}
            completedActivities={completedSet}
            totalCount={6}
            partNumber={3}
            partColor={PART_COLOR}
          />
        </div>

        <div className="mb-4 flex items-center gap-2 overflow-x-auto lg:hidden">
          {PART3_ACTIVITIES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => handleSelect(a.id)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                p3.currentActivity === a.id
                  ? "text-white"
                  : completedSet.has(a.id)
                    ? "text-white opacity-60"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700"
              }`}
              style={{
                backgroundColor: p3.currentActivity === a.id || completedSet.has(a.id) ? PART_COLOR : undefined,
              }}
            >
              {completedSet.has(a.id) ? "\u2713" : a.id}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSelect(0)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              p3.currentActivity === 0
                ? "text-white"
                : "bg-gray-200 text-gray-500 dark:bg-gray-700"
            }`}
            style={{
              backgroundColor: p3.currentActivity === 0 ? PART_COLOR : undefined,
            }}
          >
            Reflect
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {p3.currentActivity !== 0 && <CrossPartReference activityId={p3.currentActivity} />}
          {p3.currentActivity === 11 && <OneLineProposal onNext={handleNext} />}
          {p3.currentActivity === 12 && <HypothesisBoard onNext={handleNext} />}
          {p3.currentActivity === 13 && <ZeroCostMvp onNext={handleNext} />}
          {p3.currentActivity === 14 && <ValueLadder onNext={handleNext} />}
          {p3.currentActivity === 22 && <RevenueCalculator onNext={handleNext} />}
          {p3.currentActivity === 23 && <GrowthDashboard onNext={handleNext} />}
          {p3.currentActivity === 0 && <Part3Reflection />}

          {/* AI Insight Panel */}
          {currentActivityMeta && p3.currentActivity > 0 && (
            <AiInsightPanel
              activityId={p3.currentActivity}
              activityName={currentActivityMeta.title}
              className="mt-6"
            />
          )}
        </div>
      </div>
    </div>
  );
}
