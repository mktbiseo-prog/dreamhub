"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCafeStore } from "@/store/useCafeStore";
import { useCafeEvents } from "@/hooks/useCafeEvents";
import { requestNotificationPermission } from "@/lib/notifications";
import { MOCK_CAFE_ID } from "@/data/mockCafe";
import { CafeStatusBanner } from "@/components/cafe/CafeStatusBanner";
import { CheckInButton } from "@/components/cafe/CheckInButton";
import { CurrentDreamersPreview } from "@/components/cafe/CurrentDreamersPreview";
import { DoorbellPreview } from "@/components/cafe/DoorbellPreview";
import { ConnectionStatus } from "@/components/cafe/ConnectionStatus";

export default function CafePage() {
  const {
    currentCafe,
    checkedInDreamers,
    doorbellDreams,
    isLoadingCafe,
    pendingRingCount,
    fetchCafe,
    fetchCheckedInDreamers,
    fetchDoorbellDreams,
    fetchRings,
  } = useCafeStore();

  const connectionStatus = useCafeEvents(MOCK_CAFE_ID);

  useEffect(() => {
    fetchCafe(MOCK_CAFE_ID);
    fetchCheckedInDreamers(MOCK_CAFE_ID);
    fetchDoorbellDreams();
    fetchRings();
  }, [fetchCafe, fetchCheckedInDreamers, fetchDoorbellDreams, fetchRings]);

  // Request notification permission once
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (isLoadingCafe || !currentCafe) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6C3CE1] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <CafeStatusBanner cafe={currentCafe} />
        <ConnectionStatus status={connectionStatus} />
      </div>

      <CheckInButton />

      {/* Doorbell section */}
      <div className="flex items-center justify-between">
        <DoorbellPreview dreams={doorbellDreams} />
      </div>

      {/* Quick access to doorbell */}
      <Link
        href="/cafe/doorbell"
        className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F1FF] dark:bg-[#6C3CE1]/10">
            <svg
              className="h-5 w-5 text-[#6C3CE1] dark:text-[#B4A0F0]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Dream Doorbell
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Share your dream &amp; ring others
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pendingRingCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {pendingRingCount}
            </span>
          )}
          <svg
            className="h-5 w-5 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </Link>

      <CurrentDreamersPreview dreamers={checkedInDreamers} />
    </div>
  );
}
