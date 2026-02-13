"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Grid2x2, Box, Loader2 } from "lucide-react";
import { BrainGraph } from "./BrainGraph";
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
  const [view, setView] = useState<"2d" | "3d">("2d");

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
        <BrainGraph thoughts={thoughts} connections={connections} />
      ) : (
        <BrainGraph3D thoughts={thoughts} connections={connections} />
      )}
    </div>
  );
}
