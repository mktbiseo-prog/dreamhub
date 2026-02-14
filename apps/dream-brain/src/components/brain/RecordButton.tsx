"use client";

import { Mic, Square } from "lucide-react";
import { cn } from "@dreamhub/design-system";

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
  onTypeInstead: () => void;
  duration?: number;
  className?: string;
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RecordButton({
  isRecording,
  onPress,
  onTypeInstead,
  duration = 0,
  className,
}: RecordButtonProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Recording timer */}
      {isRecording && (
        <span className="text-sm font-mono text-[var(--dream-recording-active)]">
          {formatTimer(duration)}
        </span>
      )}

      {/* Button with pulse ring */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring when recording */}
        {isRecording && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              animationDuration: "1.2s",
            }}
          />
        )}

        <button
          type="button"
          onClick={onPress}
          className={cn(
            "relative z-10 flex h-[120px] w-[120px] items-center justify-center rounded-full transition-colors duration-200",
            isRecording
              ? "shadow-[0_0_0_12px_rgba(239,68,68,0.15)]"
              : "dream-breathe shadow-[0_8px_32px_rgba(124,58,237,0.35)]",
          )}
          style={{
            backgroundColor: isRecording
              ? "var(--dream-recording-active)"
              : "var(--dream-color-primary)",
          }}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? (
            <Square className="h-8 w-8 fill-white text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </button>
      </div>

      {/* Helper text */}
      {!isRecording && (
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-[var(--dream-neutral-400)]">
            Tap to record
          </span>
          <button
            type="button"
            onClick={onTypeInstead}
            className="text-xs text-[var(--dream-color-primary)] hover:underline"
          >
            Type instead
          </button>
        </div>
      )}

      {/* Tap to stop hint when recording */}
      {isRecording && (
        <span className="text-xs text-[var(--dream-neutral-400)]">
          Tap to stop
        </span>
      )}
    </div>
  );
}
