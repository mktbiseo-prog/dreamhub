"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import { Textarea } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";
import type { TeamCheckIn } from "@/types";
import { CURRENT_USER_ID } from "@/data/mockData";

const MOOD_EMOJIS = [
  { value: 1, emoji: "😟", label: "Struggling" },
  { value: 2, emoji: "😐", label: "Okay" },
  { value: 3, emoji: "🙂", label: "Good" },
  { value: 4, emoji: "😊", label: "Great" },
  { value: 5, emoji: "🚀", label: "Amazing" },
];

interface TeamCheckInProps {
  teamId: string;
  checkIns: TeamCheckIn[];
  onSubmit: (checkIn: Omit<TeamCheckIn, "id">) => void;
}

export function TeamCheckInSection({ teamId, checkIns, onSubmit }: TeamCheckInProps) {
  const [mood, setMood] = useState(3);
  const [progress, setProgress] = useState("");
  const [blockers, setBlockers] = useState("");
  const [showForm, setShowForm] = useState(false);

  const teamCheckIns = checkIns
    .filter((c) => c.teamId === teamId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  function handleSubmit() {
    onSubmit({
      teamId,
      userId: CURRENT_USER_ID,
      userName: "You",
      date: new Date().toISOString(),
      mood,
      progress: progress.trim(),
      blockers: blockers.trim(),
    });
    setProgress("");
    setBlockers("");
    setMood(3);
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Weekly Check-in
        </h3>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            New Check-in
          </Button>
        )}
      </div>

      {/* New check-in form */}
      {showForm && (
        <div className="rounded-[12px] border border-brand-200 bg-brand-50/30 p-4 dark:border-brand-900/30 dark:bg-brand-900/10">
          {/* Mood */}
          <div className="mb-3">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              How are you feeling this week?
            </p>
            <div className="flex gap-2">
              {MOOD_EMOJIS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 rounded-[8px] border py-2 text-lg transition-colors",
                    mood === m.value
                      ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/30"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                  )}
                  title={m.label}
                >
                  {m.emoji}
                  <span className="text-[9px] text-gray-400">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Progress</p>
            <Textarea
              placeholder="What did you accomplish?"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Blockers */}
          <div className="mb-3">
            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Blockers</p>
            <Textarea
              placeholder="Any obstacles? (optional)"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!progress.trim()}>
              Submit Check-in
            </Button>
          </div>
        </div>
      )}

      {/* History */}
      {teamCheckIns.length > 0 ? (
        <div className="space-y-2">
          {teamCheckIns.map((c) => (
            <div
              key={c.id}
              className="rounded-[8px] border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{MOOD_EMOJIS[c.mood - 1]?.emoji ?? "🙂"}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {c.userName}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(c.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {c.progress && (
                <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300">{c.progress}</p>
              )}
              {c.blockers && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Blocked: {c.blockers}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-gray-400">
          No check-ins yet — be the first!
        </p>
      )}
    </div>
  );
}
