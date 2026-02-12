"use client";

import { useState } from "react";
import { Mic, Plus, X, PenLine } from "lucide-react";
import { cn } from "@dreamhub/ui";
import { CaptureModal } from "./CaptureModal";

export function FabButton() {
  const [expanded, setExpanded] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);

  function handleTextCapture() {
    setExpanded(false);
    setCaptureOpen(true);
  }

  return (
    <>
      {/* Backdrop when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Sub-actions */}
      <div
        className={cn(
          "fixed bottom-[108px] left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-3 transition-all duration-200",
          expanded
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <button
          type="button"
          onClick={handleTextCapture}
          className="flex items-center gap-2 rounded-full bg-gray-800 border border-white/10 px-4 py-2.5 text-sm text-gray-200 shadow-xl transition-colors hover:bg-gray-700"
        >
          <PenLine className="h-4 w-4 text-brand-400" />
          Write a thought
        </button>
        <button
          type="button"
          disabled
          className="flex items-center gap-2 rounded-full bg-gray-800 border border-white/10 px-4 py-2.5 text-sm text-gray-500 shadow-xl cursor-not-allowed"
        >
          <Mic className="h-4 w-4" />
          Voice recording
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">
            Soon
          </span>
        </button>
      </div>

      {/* Main FAB */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "fixed bottom-24 left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full shadow-[0_0_32px_rgba(139,92,246,0.35)] transition-all duration-200",
          expanded
            ? "bg-gray-800 rotate-45 shadow-none"
            : "bg-gradient-to-br from-brand-500 to-blue-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] active:scale-95"
        )}
        aria-label={expanded ? "Close menu" : "Add a thought"}
      >
        {expanded ? (
          <X className="h-6 w-6 text-gray-300 -rotate-45" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </button>

      <CaptureModal open={captureOpen} onClose={() => setCaptureOpen(false)} />
    </>
  );
}
