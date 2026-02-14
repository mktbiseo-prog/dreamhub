"use client";

import { usePlannerStore } from "@/lib/store";
import { PART4_ACTIVITIES } from "@/types/part4";
import { ActivitySidebar } from "./ActivitySidebar";
import { AiInsightPanel } from "./AiInsightPanel";
import { FirstTenFans } from "@/components/activities/part4/FirstTenFans";
import { Dream5Network } from "@/components/activities/part4/Dream5Network";
import { RejectionCollection } from "@/components/activities/part4/RejectionCollection";
import { SustainableSystem } from "@/components/activities/part4/SustainableSystem";
import { TrafficLightAnalysis } from "@/components/activities/part4/TrafficLightAnalysis";
import { SustainabilityChecklist } from "@/components/activities/part4/SustainabilityChecklist";
import { Part4Reflection } from "@/components/activities/part4/Part4Reflection";
import { CrossPartReference } from "./CrossPartReference";
import { SupportSystemMap } from "@/components/planner/SupportSystemMap";
import { SprintPlan } from "@/components/planner/SprintPlan";

const PART_COLOR = "var(--dream-part-4)";

export function Part4Shell() {
  const { data, store } = usePlannerStore();
  const p4 = data.part4;
  const completedSet = new Set(p4.completedActivities);

  const handleNext = () => {
    if (!p4.completedActivities.includes(p4.currentActivity)) {
      const meta = PART4_ACTIVITIES.find((a) => a.id === p4.currentActivity);
      store.setPart4Data({
        completedActivities: [...p4.completedActivities, p4.currentActivity],
      });
      store.createSnapshot(meta ? `Completed: ${meta.title}` : `Completed Activity ${p4.currentActivity}`);
    }
    const idx = PART4_ACTIVITIES.findIndex((a) => a.id === p4.currentActivity);
    if (idx < PART4_ACTIVITIES.length - 1) {
      store.setPart4Data({ currentActivity: PART4_ACTIVITIES[idx + 1].id });
    } else {
      store.setPart4Data({ currentActivity: 0 });
    }
  };

  const handleSelect = (id: number) => {
    store.setPart4Data({ currentActivity: id });
  };

  const currentActivityMeta = PART4_ACTIVITIES.find((a) => a.id === p4.currentActivity);

  return (
    <div>
      {/* Part color bar */}
      <div className="mb-6 h-1 w-full rounded-full" style={{ backgroundColor: PART_COLOR }} />

      {/* Instruction card */}
      {currentActivityMeta && p4.currentActivity > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
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
            activities={PART4_ACTIVITIES}
            currentActivity={p4.currentActivity}
            onSelect={handleSelect}
            completedActivities={completedSet}
            totalCount={8}
            partNumber={4}
            partColor={PART_COLOR}
          />
        </div>

        <div className="mb-4 flex items-center gap-2 overflow-x-auto lg:hidden">
          {PART4_ACTIVITIES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => handleSelect(a.id)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                p4.currentActivity === a.id
                  ? "text-white"
                  : completedSet.has(a.id)
                    ? "text-white opacity-60"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700"
              }`}
              style={{
                backgroundColor: p4.currentActivity === a.id || completedSet.has(a.id) ? PART_COLOR : undefined,
              }}
            >
              {completedSet.has(a.id) ? "\u2713" : a.id}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSelect(0)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              p4.currentActivity === 0
                ? "text-white"
                : "bg-gray-200 text-gray-500 dark:bg-gray-700"
            }`}
            style={{
              backgroundColor: p4.currentActivity === 0 ? PART_COLOR : undefined,
            }}
          >
            Reflect
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {p4.currentActivity !== 0 && <CrossPartReference activityId={p4.currentActivity} />}
          {p4.currentActivity === 15 && <FirstTenFans onNext={handleNext} />}
          {p4.currentActivity === 16 && <Dream5Network onNext={handleNext} />}
          {p4.currentActivity === 17 && <RejectionCollection onNext={handleNext} />}
          {p4.currentActivity === 18 && <SustainableSystem onNext={handleNext} />}
          {p4.currentActivity === 19 && <TrafficLightAnalysis onNext={handleNext} />}
          {p4.currentActivity === 20 && <SustainabilityChecklist onNext={handleNext} />}
          {p4.currentActivity === 24 && <SupportSystemMap onNext={handleNext} />}
          {p4.currentActivity === 25 && <SprintPlan onNext={handleNext} />}
          {p4.currentActivity === 0 && <Part4Reflection />}

          {/* AI Insight Panel */}
          {currentActivityMeta && p4.currentActivity > 0 && (
            <AiInsightPanel
              activityId={p4.currentActivity}
              activityName={currentActivityMeta.title}
              className="mt-6"
            />
          )}
        </div>
      </div>
    </div>
  );
}
