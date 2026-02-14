"use client";

import { useState, useCallback, useRef } from "react";
import { Button, cn } from "@dreamhub/ui";

// ── Types ──
type LightColor = "red" | "yellow" | "green";

interface TrafficItem {
  id: string;
  text: string;
  color: LightColor;
}

const COLUMN_CONFIG: Record<LightColor, { label: string; sublabel: string; bg: string; border: string; text: string; headerBg: string }> = {
  red: {
    label: "Stop",
    sublabel: "Risks",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    headerBg: "bg-red-500",
  },
  yellow: {
    label: "Caution",
    sublabel: "Concerns",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-300",
    headerBg: "bg-yellow-500",
  },
  green: {
    label: "Go",
    sublabel: "Strengths",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-300",
    headerBg: "bg-green-500",
  },
};

const COLUMNS: LightColor[] = ["red", "yellow", "green"];

function getTip(items: TrafficItem[]): string {
  const red = items.filter((i) => i.color === "red").length;
  const yellow = items.filter((i) => i.color === "yellow").length;
  const green = items.filter((i) => i.color === "green").length;

  if (items.length === 0) return "Add items to each column to analyze your strengths, concerns, and risks.";
  if (red > green && red > yellow) return "Many risks identified. Consider creating mitigation strategies for each red item before moving forward.";
  if (yellow > green) return "Several concerns need attention. Try to convert yellow items to green by addressing them one at a time.";
  if (green > red + yellow) return "Looking strong! Your strengths outweigh your risks. Build on this momentum.";
  if (red === 0 && yellow === 0) return "All green — make sure you have honestly assessed potential risks and concerns.";
  return "Balanced analysis. Focus on converting yellow items to green and mitigating red risks.";
}

export function TrafficLightAnalysisActivity({ onNext }: { onNext: () => void }) {
  const [items, setItems] = useState<TrafficItem[]>([]);
  const [inputs, setInputs] = useState<Record<LightColor, string>>({
    red: "",
    yellow: "",
    green: "",
  });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const dragOverColumn = useRef<LightColor | null>(null);

  const addItem = useCallback(
    (color: LightColor) => {
      const text = inputs[color].trim();
      if (!text) return;
      setItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text, color },
      ]);
      setInputs((prev) => ({ ...prev, [color]: "" }));
    },
    [inputs]
  );

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleDragStart = useCallback((id: string) => {
    setDraggedItem(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, color: LightColor) => {
    e.preventDefault();
    dragOverColumn.current = color;
  }, []);

  const handleDrop = useCallback(
    (color: LightColor) => {
      if (!draggedItem) return;
      setItems((prev) =>
        prev.map((item) =>
          item.id === draggedItem ? { ...item, color } : item
        )
      );
      setDraggedItem(null);
      dragOverColumn.current = null;
    },
    [draggedItem]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    dragOverColumn.current = null;
  }, []);

  const green = items.filter((i) => i.color === "green");
  const yellow = items.filter((i) => i.color === "yellow");
  const red = items.filter((i) => i.color === "red");

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
            PART 2
          </span>
          <span className="text-xs text-gray-400">Traffic Light Analysis</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Traffic Light Analysis
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Categorize factors affecting your dream into Stop (risks), Caution (concerns), and Go (strengths). Drag items between columns to reclassify.
        </p>
      </div>

      {/* Three Columns */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map((color) => {
          const config = COLUMN_CONFIG[color];
          const columnItems = items.filter((i) => i.color === color);

          return (
            <div
              key={color}
              className={cn(
                "rounded-[12px] border p-4 transition-all",
                config.bg,
                config.border,
                draggedItem && dragOverColumn.current === color && "ring-2 ring-brand-500"
              )}
              onDragOver={(e) => handleDragOver(e, color)}
              onDrop={() => handleDrop(color)}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center gap-2">
                <div className={cn("h-4 w-4 rounded-full", config.headerBg)} />
                <h3 className={cn("text-sm font-bold", config.text)}>
                  {config.label} / {config.sublabel}
                </h3>
                <span className="ml-auto rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800/60 dark:text-gray-400">
                  {columnItems.length}
                </span>
              </div>

              {/* Add Input */}
              <div className="mb-3 flex gap-1">
                <input
                  type="text"
                  value={inputs[color]}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [color]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && addItem(color)}
                  placeholder={`Add ${config.sublabel.toLowerCase()}...`}
                  className="flex-1 rounded-[8px] border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => addItem(color)}
                  className={cn(
                    "shrink-0 rounded-[8px] px-2 py-1.5 text-xs font-semibold text-white transition-colors",
                    config.headerBg
                  )}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Items */}
              <div className="min-h-[100px] space-y-2">
                {columnItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "group flex items-start gap-2 rounded-[8px] border bg-white p-2.5 transition-all dark:bg-gray-900",
                      config.border,
                      draggedItem === item.id && "opacity-50"
                    )}
                  >
                    {/* Drag handle */}
                    <div className="mt-0.5 cursor-grab text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5" />
                        <circle cx="15" cy="6" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="18" r="1.5" />
                        <circle cx="15" cy="18" r="1.5" />
                      </svg>
                    </div>
                    <span className="flex-1 text-xs text-gray-700 dark:text-gray-300">
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="shrink-0 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))}
                {columnItems.length === 0 && (
                  <p className="py-4 text-center text-[10px] text-gray-400">
                    No items yet. Add or drag items here.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      {items.length > 0 && (
        <div className="mb-6 rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Summary
          </h4>
          <div className="mb-3 flex gap-3">
            <div className="flex-1 rounded-[8px] bg-green-50 p-3 text-center dark:bg-green-950/30">
              <p className="text-lg font-bold text-green-700 dark:text-green-300">{green.length}</p>
              <p className="text-[10px] text-green-600 dark:text-green-400">Strengths</p>
            </div>
            <div className="flex-1 rounded-[8px] bg-yellow-50 p-3 text-center dark:bg-yellow-950/30">
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{yellow.length}</p>
              <p className="text-[10px] text-yellow-600 dark:text-yellow-400">Concerns</p>
            </div>
            <div className="flex-1 rounded-[8px] bg-red-50 p-3 text-center dark:bg-red-950/30">
              <p className="text-lg font-bold text-red-700 dark:text-red-300">{red.length}</p>
              <p className="text-[10px] text-red-600 dark:text-red-400">Risks</p>
            </div>
          </div>
          {/* Distribution Bar */}
          {items.length > 0 && (
            <div className="mb-3 flex h-3 overflow-hidden rounded-full">
              {green.length > 0 && (
                <div
                  className="bg-green-400 transition-all"
                  style={{ width: `${(green.length / items.length) * 100}%` }}
                />
              )}
              {yellow.length > 0 && (
                <div
                  className="bg-yellow-400 transition-all"
                  style={{ width: `${(yellow.length / items.length) * 100}%` }}
                />
              )}
              {red.length > 0 && (
                <div
                  className="bg-red-400 transition-all"
                  style={{ width: `${(red.length / items.length) * 100}%` }}
                />
              )}
            </div>
          )}
          {/* Tip */}
          <div className="rounded-[8px] bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">Analysis</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {getTip(items)}
            </p>
          </div>
        </div>
      )}

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
