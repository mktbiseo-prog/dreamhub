"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { ScanNote, ScanTab } from "@/types/part2";
import { SCAN_TAB_LABELS } from "@/types/part2";

export function MarketScan({ onNext }: { onNext: () => void }) {
  const { data, store } = usePlannerStore();
  const scan = data.part2.marketScan;
  const [activeTab, setActiveTab] = useState<ScanTab>("youtube");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const addNote = useCallback(
    (type: ScanNote["type"]) => {
      const newNote: ScanNote = { id: crypto.randomUUID(), text: "", type };
      store.setPart2Data({
        marketScan: {
          ...scan,
          [activeTab]: [...scan[activeTab], newNote],
        },
      });
    },
    [scan, activeTab, store]
  );

  const updateNote = useCallback(
    (noteId: string, text: string) => {
      store.setPart2Data({
        marketScan: {
          ...scan,
          [activeTab]: scan[activeTab].map((n) =>
            n.id === noteId ? { ...n, text } : n
          ),
        },
      });
    },
    [scan, activeTab, store]
  );

  const deleteNote = useCallback(
    (noteId: string) => {
      store.setPart2Data({
        marketScan: {
          ...scan,
          [activeTab]: scan[activeTab].filter((n) => n.id !== noteId),
        },
      });
    },
    [scan, activeTab, store]
  );

  const tabs: ScanTab[] = ["youtube", "bookstore", "community"];
  const noteTypes: { key: ScanNote["type"]; label: string; color: string }[] = [
    { key: "discovery", label: "Discovery", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    { key: "reaction", label: "Reaction", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
    { key: "missed", label: "Missed Opportunity", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  ];

  const totalNotes = scan.youtube.length + scan.bookstore.length + scan.community.length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 2
          </span>
          <span className="text-xs text-gray-400">Activity 9</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          30-Minute Market Scan
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Spend 10 minutes on each channel. Capture discoveries, reactions, and missed opportunities.
        </p>
      </div>

      {/* Timer */}
      <div className="mb-6 flex items-center gap-4 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={timerRunning ? "outline" : "default"}
            onClick={() => {
              if (timerRunning) {
                setTimerRunning(false);
              } else {
                if (timeLeft === 0) setTimeLeft(600);
                setTimerRunning(true);
              }
            }}
          >
            {timerRunning ? "Pause" : timeLeft === 0 ? "Restart" : "Start"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setTimerRunning(false);
              setTimeLeft(600);
            }}
          >
            Reset
          </Button>
        </div>
        <span className="ml-auto text-xs text-gray-400">
          10 min per channel
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-[8px] bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-[6px] px-4 py-2 text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            )}
          >
            {SCAN_TAB_LABELS[tab]}
            {scan[tab].length > 0 && (
              <span className="ml-1.5 rounded-full bg-brand-100 px-1.5 text-xs text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                {scan[tab].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notes */}
      <div className="mb-6 space-y-3">
        {scan[activeTab].map((note) => {
          const noteType = noteTypes.find((t) => t.key === note.type);
          return (
            <div
              key={note.id}
              className="flex items-start gap-3 rounded-card border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <span className={cn("mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", noteType?.color)}>
                {noteType?.label}
              </span>
              <textarea
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
                placeholder="What did you notice?"
                rows={2}
                className="min-h-[48px] flex-1 resize-none border-0 bg-transparent p-0 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none dark:text-gray-300"
              />
              <button
                type="button"
                onClick={() => deleteNote(note.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Add Note Buttons */}
        <div className="flex gap-2">
          {noteTypes.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => addNote(type.key)}
              className={cn(
                "flex-1 rounded-[8px] border border-dashed py-2 text-xs font-medium transition-colors hover:opacity-80",
                type.color
              )}
            >
              + {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Board */}
      {totalNotes > 0 && (
        <div className="mb-6 rounded-card bg-gradient-to-r from-brand-50 to-blue-50 p-5 dark:from-brand-950 dark:to-blue-950">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Scan Summary
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {tabs.map((tab) => (
              <div key={tab} className="rounded-[8px] bg-white/60 p-3 dark:bg-gray-900/40">
                <h4 className="mb-1 text-xs font-semibold text-gray-500">
                  {SCAN_TAB_LABELS[tab]}
                </h4>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {scan[tab].length} notes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Market Report */}
      {totalNotes >= 3 && (() => {
        const allNotes = [...scan.youtube, ...scan.bookstore, ...scan.community];
        const discoveries = allNotes.filter((n) => n.type === "discovery").length;
        const reactions = allNotes.filter((n) => n.type === "reaction").length;
        const missed = allNotes.filter((n) => n.type === "missed").length;
        const channelCount = tabs.filter((t) => scan[t].length > 0).length;

        return (
          <div className="mb-6 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50 p-4 dark:border-brand-800 dark:from-brand-950 dark:to-blue-950">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">AI</span>
              <span className="text-xs font-medium text-brand-700 dark:text-brand-300">Market Analysis Report</span>
            </div>
            <div className="space-y-2">
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Research Coverage</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {channelCount}/3 channels scanned with {totalNotes} total observations.
                  {channelCount === 3 ? " Great — multi-channel research gives you the full picture." : ` Consider scanning ${3 - channelCount} more channel(s) for a complete view.`}
                </p>
              </div>
              {discoveries > 0 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Market Opportunity</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    You found {discoveries} discovery notes — these are signals of market demand.
                    {missed > 0 ? ` Combined with ${missed} gaps you spotted, there's a clear opportunity to fill.` : " Look for patterns across discoveries to find your niche."}
                  </p>
                </div>
              )}
              {reactions > 0 && (
                <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Competitive Landscape</p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {reactions} reaction notes collected. People&apos;s responses reveal what resonates and what doesn&apos;t — use this to differentiate.
                  </p>
                </div>
              )}
              <div className="rounded-[8px] bg-white p-3 dark:bg-gray-800">
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Next Step</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {missed > discoveries ? "You've identified more gaps than existing solutions — that's a strong signal. Use these gaps in PART 3's hypothesis board." : "Combine your discoveries with your Why from the next activity to find your unique angle."}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Next Activity
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
