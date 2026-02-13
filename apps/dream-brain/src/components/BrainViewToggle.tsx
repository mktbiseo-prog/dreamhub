"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Grid2x2, Box, Loader2 } from "lucide-react";
import { BrainGraph } from "./BrainGraph";
import { TimeSlider } from "./TimeSlider";
import type { ThoughtData, ConnectionData } from "@/lib/data";

const BrainGraph3D = dynamic(
  () => import("./BrainGraph3D").then((m) => m.BrainGraph3D),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center"
        style={{ height: "calc(100vh - 140px)" }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    ),
  }
);

interface BrainViewToggleProps {
  thoughts: ThoughtData[];
  connections: ConnectionData[];
}

export function BrainViewToggle({ thoughts, connections }: BrainViewToggleProps) {
  const [view, setView] = useState<"2d" | "3d">("3d");

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
    return thoughts.filter((t) => new Date(t.createdAt) <= new Date(effectiveCutoff));
  }, [thoughts, effectiveCutoff]);

  const filteredConnections = useMemo(() => {
    if (!effectiveCutoff) return connections;
    const thoughtIds = new Set(filteredThoughts.map((t) => t.id));
    return connections.filter((c) => thoughtIds.has(c.sourceId) && thoughtIds.has(c.targetId));
  }, [connections, filteredThoughts, effectiveCutoff]);

  return (
    <div className="relative h-full w-full">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setView(view === "2d" ? "3d" : "2d")}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-lg bg-gray-800/90 border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 backdrop-blur-sm transition-colors hover:bg-gray-700/90 hover:text-gray-100"
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
        <BrainGraph thoughts={filteredThoughts} connections={filteredConnections} />
      ) : (
        <BrainGraph3D thoughts={filteredThoughts} connections={filteredConnections} />
      )}

      {/* Time Slider */}
      {dateRange && (
        <div className="absolute bottom-4 left-4 right-4 z-20 rounded-xl bg-gray-900/80 border border-white/10 px-4 py-3 backdrop-blur-sm">
          <TimeSlider
            minDate={dateRange.min}
            maxDate={dateRange.max}
            value={effectiveCutoff!}
            onChange={setCutoffDate}
          />
        </div>
      )}
    </div>
  );
}
