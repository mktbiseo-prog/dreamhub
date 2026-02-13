"use client";

import { usePlannerStore } from "@/lib/store";
import { PART3_ACTIVITIES } from "@/types/part3";
import { ActivitySidebar } from "./ActivitySidebar";
import { OneLineProposal } from "@/components/activities/part3/OneLineProposal";
import { HypothesisBoard } from "@/components/activities/part3/HypothesisBoard";
import { ZeroCostMvp } from "@/components/activities/part3/ZeroCostMvp";
import { ValueLadder } from "@/components/activities/part3/ValueLadder";
import { Part3Reflection } from "@/components/activities/part3/Part3Reflection";
import { CrossPartReference } from "./CrossPartReference";

export function Part3Shell() {
  const { data, store } = usePlannerStore();
  const p3 = data.part3;
  const completedSet = new Set(p3.completedActivities);

  const handleNext = () => {
    if (!p3.completedActivities.includes(p3.currentActivity)) {
      store.setPart3Data({
        completedActivities: [...p3.completedActivities, p3.currentActivity],
      });
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

  return (
    <div className="flex gap-8">
      <div className="hidden lg:block">
        <ActivitySidebar
          activities={PART3_ACTIVITIES}
          currentActivity={p3.currentActivity}
          onSelect={handleSelect}
          completedActivities={completedSet}
          totalCount={4}
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
            p3.currentActivity === 0
              ? "bg-brand-500 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
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
        {p3.currentActivity === 0 && <Part3Reflection />}
      </div>
    </div>
  );
}
