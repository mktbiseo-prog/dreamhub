"use client";

import { useState, useCallback } from "react";
import { Button } from "@dreamhub/ui";

const PASSION_LABELS: { threshold: number; label: string; description: string }[] = [
  { threshold: 0, label: "Just Curious", description: "You have a spark of interest. That is enough to start exploring." },
  { threshold: 25, label: "Interested", description: "Something is pulling you in. Keep digging to find what excites you." },
  { threshold: 50, label: "Excited", description: "Your energy is growing. This could be a real passion worth pursuing." },
  { threshold: 75, label: "Passionate", description: "You feel deeply connected to this. Channel that energy into action." },
  { threshold: 100, label: "Obsessed", description: "Nothing can stop you. This is your calling. Go all in." },
];

function getLabelForLevel(level: number): { label: string; description: string } {
  let result = PASSION_LABELS[0];
  for (const item of PASSION_LABELS) {
    if (level >= item.threshold) {
      result = item;
    }
  }
  return result;
}

function getGradientColor(level: number): string {
  if (level < 25) return "#3b82f6";
  if (level < 50) return "#06b6d4";
  if (level < 75) return "#f59e0b";
  return "#ef4444";
}

export function PassionThermometer({ onNext }: { onNext: () => void }) {
  const [level, setLevel] = useState(50);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);

  const currentLabel = getLabelForLevel(level);
  const fillColor = getGradientColor(level);

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            PART 1
          </span>
          <span className="text-xs text-gray-400">Passion Thermometer</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Passion Thermometer
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          How passionate are you about your dream? Use the slider to measure your level of excitement and drive.
        </p>
      </div>

      {/* Thermometer Visual */}
      <div className="mb-8 flex flex-col items-center gap-8 md:flex-row md:items-start">
        {/* SVG Thermometer */}
        <div className="flex flex-col items-center">
          <svg width="80" height="320" viewBox="0 0 80 320" className="drop-shadow-sm">
            {/* Thermometer body */}
            <rect
              x="25"
              y="10"
              width="30"
              height="240"
              rx="15"
              className="fill-gray-200 dark:fill-gray-700"
            />
            {/* Fill */}
            <rect
              x="25"
              y={10 + 240 * (1 - level / 100)}
              width="30"
              height={240 * (level / 100)}
              rx="0"
              fill={fillColor}
              className="transition-all duration-500 ease-out"
            />
            {/* Top cap */}
            <rect
              x="25"
              y="10"
              width="30"
              height="30"
              rx="15"
              className="fill-gray-200 dark:fill-gray-700"
            />
            {level > 5 && (
              <rect
                x="25"
                y={Math.max(10, 10 + 240 * (1 - level / 100))}
                width="30"
                height="15"
                rx="15"
                fill={fillColor}
                className="transition-all duration-500 ease-out"
              />
            )}
            {/* Bulb at bottom */}
            <circle
              cx="40"
              cy="280"
              r="30"
              fill={fillColor}
              className="transition-all duration-500 ease-out"
            />
            <circle
              cx="40"
              cy="280"
              r="22"
              className="fill-white/20"
            />

            {/* Level marks */}
            {[0, 25, 50, 75, 100].map((mark) => (
              <g key={mark}>
                <line
                  x1="58"
                  y1={10 + 240 * (1 - mark / 100)}
                  x2="68"
                  y2={10 + 240 * (1 - mark / 100)}
                  className="stroke-gray-400 dark:stroke-gray-500"
                  strokeWidth="1.5"
                />
                <text
                  x="74"
                  y={14 + 240 * (1 - mark / 100)}
                  className="fill-gray-500 dark:fill-gray-400"
                  fontSize="10"
                  fontWeight="500"
                >
                  {mark}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Level Info + Slider */}
        <div className="flex-1">
          {/* Current Level Display */}
          <div className="mb-6 rounded-[12px] border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 text-center">
              <p
                className="text-4xl font-bold transition-colors duration-500"
                style={{ color: fillColor }}
              >
                {level}%
              </p>
              <p
                className="mt-1 text-lg font-semibold transition-colors duration-500"
                style={{ color: fillColor }}
              >
                {currentLabel.label}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {currentLabel.description}
              </p>
            </div>

            {/* Slider */}
            <div className="mt-6">
              <input
                type="range"
                min="0"
                max="100"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full accent-brand-500"
                style={{ accentColor: fillColor }}
              />
              <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                {PASSION_LABELS.map((item) => (
                  <span key={item.threshold} className="text-center">
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Level Labels */}
          <div className="mb-6 grid grid-cols-5 gap-1">
            {PASSION_LABELS.map((item) => (
              <button
                key={item.threshold}
                type="button"
                onClick={() => setLevel(item.threshold)}
                className={`rounded-[8px] px-2 py-2 text-center text-[10px] font-medium transition-all ${
                  level >= item.threshold && (PASSION_LABELS.indexOf(item) === PASSION_LABELS.length - 1 || level < PASSION_LABELS[PASSION_LABELS.indexOf(item) + 1].threshold)
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Reflection */}
          <div className="rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              What drives your passion?
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Reflect on what fuels your excitement. What aspects of your dream make you feel most alive?"
              rows={4}
              className="w-full resize-none rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">
                {reflection.length > 0 ? `${reflection.length} characters` : ""}
              </span>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-[8px] bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
              >
                {saved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
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
