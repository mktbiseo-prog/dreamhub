"use client";

import { usePlannerStore } from "@/lib/store";
import { PART2_ACTIVITIES } from "@/types/part2";
import { ActivitySidebar } from "./ActivitySidebar";
import { AiInsightPanel } from "./AiInsightPanel";
import { CrossPartReference } from "./CrossPartReference";
import { ExperienceMindMap } from "@/components/activities/part2/ExperienceMindMap";
import { FailureResume } from "@/components/activities/part2/FailureResume";
import { StrengthsRedefine } from "@/components/activities/part2/StrengthsRedefine";
import { MarketScan } from "@/components/activities/part2/MarketScan";
import { WhyWhatBridge } from "@/components/activities/part2/WhyWhatBridge";
import { Part2Reflection } from "@/components/activities/part2/Part2Reflection";

export function Part2Shell() {
  const { data, store } = usePlannerStore();
  const p2 = data.part2;
  const completedSet = new Set(p2.completedActivities);

  const handleNext = () => {
    if (!p2.completedActivities.includes(p2.currentActivity)) {
      const meta = PART2_ACTIVITIES.find((a) => a.id === p2.currentActivity);
      store.setPart2Data({
        completedActivities: [...p2.completedActivities, p2.currentActivity],
      });
      store.createSnapshot(meta ? `Completed: ${meta.title}` : `Completed Activity ${p2.currentActivity}`);
    }
    const idx = PART2_ACTIVITIES.findIndex((a) => a.id === p2.currentActivity);
    if (idx < PART2_ACTIVITIES.length - 1) {
      store.setPart2Data({ currentActivity: PART2_ACTIVITIES[idx + 1].id });
    } else {
      store.setPart2Data({ currentActivity: 0 });
    }
  };

  const handleSelect = (id: number) => {
    store.setPart2Data({ currentActivity: id });
  };

  const currentActivityMeta = PART2_ACTIVITIES.find((a) => a.id === p2.currentActivity);

  return (
    <div className="flex gap-8">
      <div className="hidden lg:block">
        <ActivitySidebar
          activities={PART2_ACTIVITIES}
          currentActivity={p2.currentActivity}
          onSelect={handleSelect}
          completedActivities={completedSet}
          totalCount={5}
        />
      </div>

      {/* Mobile indicator */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto lg:hidden">
        {PART2_ACTIVITIES.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => handleSelect(a.id)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
              p2.currentActivity === a.id
                ? "bg-brand-500 text-white"
                : completedSet.has(a.id)
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {completedSet.has(a.id) ? "\u2713" : a.id}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleSelect(0)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            p2.currentActivity === 0
              ? "bg-brand-500 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          Reflect
        </button>
      </div>

      <div className="min-w-0 flex-1">
        {/* Cross-Part Reference from PART 1 */}
        {p2.currentActivity !== 0 && <CrossPartReference activityId={p2.currentActivity} />}

        {p2.currentActivity === 6 && <ExperienceMindMap onNext={handleNext} />}
        {p2.currentActivity === 7 && <FailureResume onNext={handleNext} />}
        {p2.currentActivity === 8 && <StrengthsRedefine onNext={handleNext} />}
        {p2.currentActivity === 9 && <MarketScan onNext={handleNext} />}
        {p2.currentActivity === 10 && <WhyWhatBridge onNext={handleNext} />}
        {p2.currentActivity === 0 && <Part2Reflection />}

        {/* AI Insight Panel */}
        {currentActivityMeta && p2.currentActivity > 0 && (
          <AiInsightPanel
            activityId={p2.currentActivity}
            activityName={currentActivityMeta.title}
            className="mt-6"
          />
        )}
      </div>
    </div>
  );
}
