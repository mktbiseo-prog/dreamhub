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

export function PlannerShell() {
  const { data, store } = usePlannerStore();
  const completedSet = new Set(data.completedActivities);

  const handleNext = () => {
    store.markActivityComplete(data.currentActivity);
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
    <div className="flex gap-8">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <ActivitySidebar
          activities={PART1_ACTIVITIES}
          currentActivity={data.currentActivity}
          onSelect={handleSelectActivity}
          completedActivities={completedSet}
          totalCount={5}
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
                ? "bg-brand-500 text-white"
                : completedSet.has(id)
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {completedSet.has(id) ? "\u2713" : id}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleSelectActivity(0)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            data.currentActivity === 0
              ? "bg-brand-500 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
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
  );
}
