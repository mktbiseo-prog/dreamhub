"use client";

import { useMemo } from "react";

interface TimeSliderProps {
  minDate: string;
  maxDate: string;
  value: string;
  onChange: (date: string) => void;
}

function formatLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TimeSlider({ minDate, maxDate, value, onChange }: TimeSliderProps) {
  const minTs = useMemo(() => new Date(minDate).getTime(), [minDate]);
  const maxTs = useMemo(() => new Date(maxDate).getTime(), [maxDate]);
  const valueTs = new Date(value).getTime();

  if (minTs >= maxTs) return null;

  return (
    <div className="flex flex-col items-center gap-1 w-full px-4">
      <span className="text-xs font-medium text-brand-300">
        {formatLabel(value)}
      </span>
      <input
        type="range"
        min={minTs}
        max={maxTs}
        value={valueTs}
        onChange={(e) => onChange(new Date(Number(e.target.value)).toISOString())}
        className="w-full h-1.5 appearance-none rounded-full bg-white/10 cursor-pointer accent-brand-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(139,92,246,0.5)]"
      />
      <div className="flex w-full justify-between">
        <span className="text-[10px] text-gray-600">{formatLabel(minDate)}</span>
        <span className="text-[10px] text-gray-600">{formatLabel(maxDate)}</span>
      </div>
    </div>
  );
}
