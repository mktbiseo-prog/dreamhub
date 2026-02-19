"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import { cn } from "@dreamhub/ui";

const RESONATE_OPTIONS = [
  { id: "dream", label: "Their dream vision" },
  { id: "skills", label: "Complementary skills" },
  { id: "workstyle", label: "Work style fit" },
  { id: "interests", label: "Shared interests" },
  { id: "location", label: "Location match" },
];

interface ResonateSheetProps {
  partnerName: string;
  onSubmit: (elements: string[]) => void;
  onClose: () => void;
}

export function ResonateSheet({ partnerName, onSubmit, onClose }: ResonateSheetProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl dark:bg-neutral-950">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          What resonated with you?
        </h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Tell {partnerName} what caught your eye
        </p>

        <div className="mt-4 space-y-2">
          {RESONATE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                selected.includes(opt.id)
                  ? "border-[#6C3CE1] bg-[#F5F1FF] text-[#6C3CE1]"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="ghost" onClick={() => onSubmit([])} className="flex-1">
            Skip
          </Button>
          <Button
            onClick={() => onSubmit(selected)}
            className="flex-1"
            disabled={selected.length === 0}
          >
            Send Interest
          </Button>
        </div>
      </div>
    </div>
  );
}
