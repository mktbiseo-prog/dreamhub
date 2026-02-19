"use client";

import { usePlannerStore } from "@/lib/store";
import { PART1_ACTIVITIES } from "@/types/planner";
import { ActivitySidebar } from "./ActivitySidebar";
import { AiInsightPanel } from "./AiInsightPanel";
import { SkillsInventory } from "@/components/activities/SkillsInventory";
import { ResourceMap } from "@/components/activities/ResourceMap";
import { TimeLog } from "@/components/activities/TimeLog";
import { MoneyFlow } from "@/components/activities/MoneyFlow";
import { CurrentState } from "@/components/activities/CurrentState";
import { Reflection } from "@/components/activities/Reflection";

const PART_COLOR = "var(--dream-part-1)";

export function PlannerShell() {
  const { data, store } = usePlannerStore();
  const completedSet = new Set(data.completedActivities);

  const handleNext = () => {
    const meta = PART1_ACTIVITIES.find((a) => a.id === data.currentActivity);
    store.markActivityComplete(data.currentActivity, meta?.title);
    if (data.currentActivity < 5) {
      store.setCurrentActivity(data.currentActivity + 1);
    } else {
      store.setCurrentActivity(0);
    }
  };

  const handleSelectActivity = (id: number) => {
    store.setCurrentActivity(id);
  };

  const currentActivityMeta = PART1_ACTIVITIES.find((a) => a.id === data.currentActivity);

  return (
    <div>
      {/* Part color bar */}
      <div className="mb-6 h-1 w-full rounded-full" style={{ backgroundColor: PART_COLOR }} />

      {/* Instruction card */}
      {currentActivityMeta && data.currentActivity > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-orange-100 bg-[#FFF3ED]/50 p-4 dark:border-orange-900/30 dark:bg-orange-950/20">
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
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <ActivitySidebar
            activities={PART1_ACTIVITIES}
            currentActivity={data.currentActivity}
            onSelect={handleSelectActivity}
            completedActivities={completedSet}
            totalCount={5}
            partNumber={1}
            partColor={PART_COLOR}
          />
        </div>

        {/* Mobile activity indicator */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto lg:hidden">
          {[1, 2, 3, 4, 5].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSelectActivity(id)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                data.currentActivity === id
                  ? "text-white"
                  : completedSet.has(id)
                    ? "text-white opacity-60"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700"
              }`}
              style={{
                backgroundColor: data.currentActivity === id || completedSet.has(id) ? PART_COLOR : undefined,
              }}
            >
              {completedSet.has(id) ? "\u2713" : id}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSelectActivity(0)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              data.currentActivity === 0
                ? "text-white"
                : "bg-gray-200 text-gray-500 dark:bg-gray-700"
            }`}
            style={{
              backgroundColor: data.currentActivity === 0 ? PART_COLOR : undefined,
            }}
          >
            Reflect
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {data.currentActivity === 1 && <SkillsInventory onNext={handleNext} />}
          {data.currentActivity === 2 && <ResourceMap onNext={handleNext} />}
          {data.currentActivity === 3 && <TimeLog onNext={handleNext} />}
          {data.currentActivity === 4 && <MoneyFlow onNext={handleNext} />}
          {data.currentActivity === 5 && <CurrentState onNext={handleNext} />}
          {data.currentActivity === 0 && <Reflection />}

          {/* AI Insight Panel — shows for all activities */}
          {currentActivityMeta && data.currentActivity > 0 && (
            <AiInsightPanel
              activityId={data.currentActivity}
              activityName={currentActivityMeta.title}
              className="mt-6"
            />
          )}
        </div>
      </div>
    </div>
  );
}
