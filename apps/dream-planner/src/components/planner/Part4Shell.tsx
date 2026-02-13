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

export function Part4Shell() {
  const { data, store } = usePlannerStore();
  const p4 = data.part4;
  const completedSet = new Set(p4.completedActivities);

  const handleNext = () => {
    if (!p4.completedActivities.includes(p4.currentActivity)) {
      store.setPart4Data({
        completedActivities: [...p4.completedActivities, p4.currentActivity],
      });
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
    <div className="flex gap-8">
      <div className="hidden lg:block">
        <ActivitySidebar
          activities={PART4_ACTIVITIES}
          currentActivity={p4.currentActivity}
          onSelect={handleSelect}
          completedActivities={completedSet}
          totalCount={6}
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
            p4.currentActivity === 0
              ? "bg-brand-500 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
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
  );
}
