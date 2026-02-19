"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCafeStore } from "@/store/useCafeStore";
import { useCafeEvents } from "@/hooks/useCafeEvents";
import { MOCK_CAFE_ID } from "@/data/mockCafe";
import { DoorbellTabBar } from "@/components/cafe/doorbell/DoorbellTabBar";
import { CategoryFilter } from "@/components/cafe/doorbell/CategoryFilter";
import { DreamCard } from "@/components/cafe/doorbell/DreamCard";
import { RingBellModal } from "@/components/cafe/doorbell/RingBellModal";
import { MyDreamEditor } from "@/components/cafe/doorbell/MyDreamEditor";
import { RingsReceivedList } from "@/components/cafe/doorbell/RingsReceivedList";
import { ConnectionStatus } from "@/components/cafe/ConnectionStatus";
import type { DoorbellDream } from "@/types/cafe";

export default function DoorbellPage() {
  const {
    doorbellDreams,
    doorbellTab,
    categoryFilter,
    ringsReceived,
    pendingRingCount,
    isLoadingDreams,
    setDoorbellTab,
    setCategoryFilter,
    fetchDoorbellDreams,
    fetchRings,
    ringBell,
    respondToRing,
  } = useCafeStore();

  const connectionStatus = useCafeEvents(MOCK_CAFE_ID);
  const [ringTarget, setRingTarget] = useState<DoorbellDream | null>(null);

  useEffect(() => {
    fetchDoorbellDreams();
    fetchRings();
  }, [fetchDoorbellDreams, fetchRings]);

  // Filter dreams based on tab and category
  const filteredDreams = doorbellDreams.filter((dream) => {
    if (doorbellTab === "here-now" && !dream.isHereNow) return false;
    if (categoryFilter && !dream.categories.includes(categoryFilter))
      return false;
    return true;
  });

  const handleRingBell = (dreamId: string) => {
    const dream = doorbellDreams.find((d) => d.id === dreamId);
    if (dream) setRingTarget(dream);
  };

  const handleConfirmRing = (dreamId: string, message?: string) => {
    ringBell(dreamId, message);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/cafe"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
        <h1 className="flex-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
          Dream Doorbell
        </h1>
        <ConnectionStatus status={connectionStatus} />
      </div>

      {/* Tab bar */}
      <DoorbellTabBar
        activeTab={doorbellTab}
        onTabChange={setDoorbellTab}
        pendingRingCount={pendingRingCount}
      />

      {/* All / Here Now tabs */}
      {(doorbellTab === "all" || doorbellTab === "here-now") && (
        <>
          <CategoryFilter
            selected={categoryFilter}
            onSelect={setCategoryFilter}
          />

          {isLoadingDreams ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6C3CE1] border-t-transparent" />
            </div>
          ) : filteredDreams.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-950">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {doorbellTab === "here-now"
                  ? "No dreamers here right now. Check back later!"
                  : "No dreams match this filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDreams.map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  onRingBell={handleRingBell}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* My Dream tab */}
      {doorbellTab === "my-dream" && (
        <div className="space-y-4">
          <MyDreamEditor />
          <RingsReceivedList
            rings={ringsReceived}
            onRespond={respondToRing}
          />
        </div>
      )}

      {/* Ring Bell Modal */}
      {ringTarget && (
        <RingBellModal
          dream={ringTarget}
          onRing={handleConfirmRing}
          onClose={() => setRingTarget(null)}
        />
      )}
    </div>
  );
}
