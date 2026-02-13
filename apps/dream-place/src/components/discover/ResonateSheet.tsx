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
      <div className="relative w-full max-w-sm rounded-t-[16px] bg-white p-6 shadow-xl sm:rounded-[16px] dark:bg-gray-950">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          What resonated with you?
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tell {partnerName} what caught your eye
        </p>

        <div className="mt-4 space-y-2">
          {RESONATE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                "w-full rounded-[8px] border px-4 py-3 text-left text-sm font-medium transition-colors",
                selected.includes(opt.id)
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
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
