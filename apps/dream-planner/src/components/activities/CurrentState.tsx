"use client";

import { useState } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { CurrentStateCard } from "@/types/planner";

const ICONS: Record<string, React.ReactNode> = {
  briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  lock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  cloud: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  ),
  sun: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

const CARD_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  job: {
    bg: "bg-blue-50 dark:bg-blue-950",
    icon: "text-blue-500",
    border: "border-blue-200 dark:border-blue-800",
  },
  role: {
    bg: "bg-brand-50 dark:bg-brand-950",
    icon: "text-brand-500",
    border: "border-brand-200 dark:border-brand-800",
  },
  constraints: {
    bg: "bg-red-50 dark:bg-red-950",
    icon: "text-red-500",
    border: "border-red-200 dark:border-red-800",
  },
  concerns: {
    bg: "bg-amber-50 dark:bg-amber-950",
    icon: "text-amber-500",
    border: "border-amber-200 dark:border-amber-800",
  },
  opportunities: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    icon: "text-emerald-500",
    border: "border-emerald-200 dark:border-emerald-800",
  },
};

function StateCard({
  card,
  isExpanded,
  onToggle,
  onUpdate,
}: {
  card: CurrentStateCard;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (content: string) => void;
}) {
  const colors = CARD_COLORS[card.key];

  return (
    <div
      className={cn(
        "cursor-pointer rounded-card border-2 p-5 transition-all",
        colors.border,
        isExpanded ? colors.bg : "bg-white hover:shadow-md dark:bg-gray-900"
      )}
      onClick={() => !isExpanded && onToggle()}
    >
      <div className="flex items-center gap-3">
        <div className={cn("shrink-0", colors.icon)}>
          {ICONS[card.icon]}
        </div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {card.title}
        </h4>
        {card.content && !isExpanded && (
          <span className="ml-auto text-xs text-green-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="ml-auto shrink-0 text-gray-400 transition-transform"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("transition-transform", isExpanded && "rotate-180")}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={card.content}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder={card.placeholder}
            rows={4}
            autoFocus
            className="w-full resize-none rounded-[8px] border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
        </div>
      )}
    </div>
  );
}

export function CurrentState({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const cards = data.currentState;
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const updateCard = (key: string, content: string) => {
    store.setCurrentState(
      cards.map((c) => (c.key === key ? { ...c, content } : c))
    );
  };

  const filledCount = cards.filter((c) => c.content.trim()).length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 1
          </span>
          <span className="text-xs text-gray-400">Activity 5 of 5</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Define My Current State
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Click each card to describe where you are right now. Be honest — this
          is your private space.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-blue-500 transition-all duration-500"
            style={{ width: `${(filledCount / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500">
          {filledCount}/5
        </span>
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {cards.map((card) => (
          <StateCard
            key={card.key}
            card={card}
            isExpanded={expandedKey === card.key}
            onToggle={() =>
              setExpandedKey(expandedKey === card.key ? null : card.key)
            }
            onUpdate={(content) => updateCard(card.key, content)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Finish PART 1
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
