"use client";

import { cn } from "@dreamhub/design-system";

interface WaveformVisualizerProps {
  /** Normalized bar heights (0-1), ideally 40 values */
  bars: number[];
  /** Current playback position 0-1 (playback mode only) */
  playbackPosition?: number;
  /** Whether this is a live recording visualization */
  isLive?: boolean;
  /** Container height in px */
  height?: number;
  className?: string;
}

const BAR_COUNT = 40;

/** Generate default bars if the input length doesn't match */
function normalizeBars(bars: number[]): number[] {
  if (bars.length === BAR_COUNT) return bars;
  if (bars.length === 0) return Array(BAR_COUNT).fill(0.1);

  // Resample to 40 bars
  const result: number[] = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const idx = Math.floor((i / BAR_COUNT) * bars.length);
    result.push(bars[idx] ?? 0.1);
  }
  return result;
}

export function WaveformVisualizer({
  bars,
  playbackPosition,
  isLive = false,
  height = 48,
  className,
}: WaveformVisualizerProps) {
  const normalizedBars = normalizeBars(bars);

  return (
    <div
      className={cn("flex items-end justify-center gap-[2px]", className)}
      style={{ height }}
    >
      {normalizedBars.map((barHeight, i) => {
        const isPlayed =
          playbackPosition != null && i / BAR_COUNT <= playbackPosition;
        const heightPercent = Math.max(barHeight * 100, 8);

        return (
          <div
            key={i}
            className={cn(
              "w-[3px] rounded-full",
              isLive ? "transition-all duration-75" : "transition-opacity duration-150",
            )}
            style={{
              height: `${heightPercent}%`,
              background:
                "linear-gradient(to top, var(--dream-color-primary), var(--dream-color-secondary))",
              opacity:
                playbackPosition != null ? (isPlayed ? 1 : 0.3) : 1,
            }}
          />
        );
      })}
    </div>
  );
}
