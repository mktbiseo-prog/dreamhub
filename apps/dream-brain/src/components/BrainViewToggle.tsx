"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Grid2x2, Box, Loader2, GripHorizontal, ChevronUp, X } from "lucide-react";
import { cn } from "@dreamhub/design-system";
// Lazy-load BrainGraph (2D) — @xyflow/react is ~100KB gzipped
const BrainGraph = dynamic(
  () => import("./BrainGraph").then((m) => m.BrainGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--dream-color-primary)]" />
      </div>
    ),
  },
);
import { TimeSlider } from "./TimeSlider";
import { NoteCard } from "./brain/NoteCard";
import { categories, type CategoryId } from "@/lib/categories";
import type { ThoughtData, ConnectionData } from "@/lib/data";

const BrainGraph3D = dynamic(
  () => import("./BrainGraph3D").then((m) => m.BrainGraph3D),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center h-full"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[var(--dream-color-primary)]" />
      </div>
    ),
  },
);

type SheetState = "collapsed" | "half" | "full";

interface BrainViewToggleProps {
  thoughts: ThoughtData[];
  connections: ConnectionData[];
}

export function BrainViewToggle({
  thoughts,
  connections,
}: BrainViewToggleProps) {
  const [view, setView] = useState<"2d" | "3d">("3d");
  const [sheet, setSheet] = useState<SheetState>("collapsed");
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | null>(null);

  // Time slider
  const dateRange = useMemo(() => {
    if (thoughts.length === 0) return null;
    const dates = thoughts.map((t) => new Date(t.createdAt).getTime());
    return {
      min: new Date(Math.min(...dates)).toISOString(),
      max: new Date(Math.max(...dates)).toISOString(),
    };
  }, [thoughts]);

  const [cutoffDate, setCutoffDate] = useState<string | null>(null);
  const effectiveCutoff = cutoffDate ?? dateRange?.max ?? null;

  const filteredThoughts = useMemo(() => {
    if (!effectiveCutoff) return thoughts;
    return thoughts.filter(
      (t) => new Date(t.createdAt) <= new Date(effectiveCutoff),
    );
  }, [thoughts, effectiveCutoff]);

  const filteredConnections = useMemo(() => {
    if (!effectiveCutoff) return connections;
    const thoughtIds = new Set(filteredThoughts.map((t) => t.id));
    return connections.filter(
      (c) => thoughtIds.has(c.sourceId) && thoughtIds.has(c.targetId),
    );
  }, [connections, filteredThoughts, effectiveCutoff]);

  // Bottom sheet notes (further filtered by category)
  const sheetThoughts = useMemo(() => {
    if (!categoryFilter) return filteredThoughts;
    return filteredThoughts.filter((t) => t.category === categoryFilter);
  }, [filteredThoughts, categoryFilter]);

  // Draggable bottom sheet
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartSheet = useRef<SheetState>("collapsed");

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      dragStartY.current = e.touches[0].clientY;
      dragStartSheet.current = sheet;
    },
    [sheet],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaY = dragStartY.current - e.changedTouches[0].clientY;
      const threshold = 60;

      if (deltaY > threshold) {
        // Swiped up
        if (dragStartSheet.current === "collapsed") setSheet("half");
        else if (dragStartSheet.current === "half") setSheet("full");
      } else if (deltaY < -threshold) {
        // Swiped down
        if (dragStartSheet.current === "full") setSheet("half");
        else if (dragStartSheet.current === "half") setSheet("collapsed");
      }
    },
    [],
  );

  const sheetHeight =
    sheet === "collapsed"
      ? "h-16"
      : sheet === "half"
        ? "h-[50vh]"
        : "h-[85vh]";

  const categoryChips = Object.values(categories);

  return (
    <div className="relative h-full w-full">
      {/* 2D/3D Toggle */}
      <button
        type="button"
        onClick={() => setView(view === "2d" ? "3d" : "2d")}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-[var(--dream-radius-md)] bg-gray-900/90 border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 backdrop-blur-sm transition-colors hover:bg-gray-800/90 hover:text-gray-100"
      >
        {view === "2d" ? (
          <>
            <Box className="h-3.5 w-3.5" />
            3D
          </>
        ) : (
          <>
            <Grid2x2 className="h-3.5 w-3.5" />
            2D
          </>
        )}
      </button>

      {/* Graph View */}
      {view === "2d" ? (
        <BrainGraph
          thoughts={filteredThoughts}
          connections={filteredConnections}
        />
      ) : (
        <BrainGraph3D
          thoughts={filteredThoughts}
          connections={filteredConnections}
        />
      )}

      {/* Time Slider */}
      {dateRange && sheet === "collapsed" && (
        <div className="absolute bottom-20 left-4 right-4 z-20 rounded-[var(--dream-radius-lg)] bg-gray-900/80 border border-white/10 px-4 py-3 backdrop-blur-sm">
          <TimeSlider
            minDate={dateRange.min}
            maxDate={dateRange.max}
            value={effectiveCutoff!}
            onChange={setCutoffDate}
          />
        </div>
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "absolute bottom-0 left-0 right-0 z-30 rounded-t-[var(--dream-radius-xl)] bg-gray-950/95 border-t border-white/[0.08] backdrop-blur-xl transition-all duration-300 ease-out",
          sheetHeight,
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Sheet header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-200">
              {sheetThoughts.length} notes
            </span>
          </div>
          <div className="flex items-center gap-1">
            {sheet !== "collapsed" && (
              <button
                type="button"
                onClick={() =>
                  setSheet(sheet === "full" ? "half" : "collapsed")
                }
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                {sheet === "full" ? (
                  <X className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                )}
              </button>
            )}
            {sheet === "collapsed" && (
              <button
                type="button"
                onClick={() => setSheet("half")}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              >
                <ChevronUp className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Sheet content (visible when not collapsed) */}
        {sheet !== "collapsed" && (
          <div className="flex flex-col h-[calc(100%-56px)] overflow-hidden">
            {/* Category filter chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-3">
              <button
                type="button"
                onClick={() => setCategoryFilter(null)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  !categoryFilter
                    ? "bg-[var(--dream-color-primary)] text-white"
                    : "bg-white/[0.06] text-gray-400 hover:bg-white/[0.1]",
                )}
              >
                All
              </button>
              {categoryChips.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setCategoryFilter(
                      categoryFilter === cat.id ? null : cat.id,
                    )
                  }
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    categoryFilter === cat.id
                      ? "bg-[var(--dream-color-primary)] text-white"
                      : "bg-white/[0.06] text-gray-400 hover:bg-white/[0.1]",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Note list */}
            <div className="flex-1 overflow-y-auto">
              {sheetThoughts.length > 0 ? (
                sheetThoughts.map((thought) => (
                  <NoteCard key={thought.id} thought={thought} />
                ))
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-gray-500">
                    No notes in this view
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
