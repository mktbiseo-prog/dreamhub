"use client";

import { cn } from "@dreamhub/ui";
import type { EmotionType } from "@dreamhub/ai";

const EMOTIONS: { id: EmotionType; emoji: string; label: string; color: string; bgColor: string }[] = [
  { id: "excited", emoji: "\u{1F525}", label: "Excited", color: "text-orange-300", bgColor: "bg-orange-500/15" },
  { id: "grateful", emoji: "\u{1F49C}", label: "Grateful", color: "text-pink-300", bgColor: "bg-pink-500/15" },
  { id: "anxious", emoji: "\u{1F630}", label: "Anxious", color: "text-yellow-300", bgColor: "bg-yellow-500/15" },
  { id: "frustrated", emoji: "\u{1F624}", label: "Frustrated", color: "text-red-300", bgColor: "bg-red-500/15" },
  { id: "curious", emoji: "\u{1F9D0}", label: "Curious", color: "text-cyan-300", bgColor: "bg-cyan-500/15" },
  { id: "calm", emoji: "\u{1F33F}", label: "Calm", color: "text-green-300", bgColor: "bg-green-500/15" },
  { id: "determined", emoji: "\u{1F4AA}", label: "Determined", color: "text-blue-300", bgColor: "bg-blue-500/15" },
  { id: "confused", emoji: "\u{1F914}", label: "Confused", color: "text-amber-300", bgColor: "bg-amber-500/15" },
  { id: "hopeful", emoji: "\u{2B50}", label: "Hopeful", color: "text-indigo-300", bgColor: "bg-indigo-500/15" },
  { id: "melancholic", emoji: "\u{1F327}\uFE0F", label: "Melancholic", color: "text-slate-300", bgColor: "bg-slate-500/15" },
];

interface EmotionFilterProps {
  selected: EmotionType | null;
  onChange: (emotion: EmotionType | null) => void;
}

export function EmotionFilter({ selected, onChange }: EmotionFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
          selected === null
            ? "bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30"
            : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"
        )}
      >
        All
      </button>
      {EMOTIONS.map((em) => (
        <button
          key={em.id}
          type="button"
          onClick={() => onChange(selected === em.id ? null : em.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            selected === em.id
              ? `${em.bgColor} ${em.color} ring-1 ring-current/30`
              : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"
          )}
        >
          <span>{em.emoji}</span>
          {em.label}
        </button>
      ))}
    </div>
  );
}
