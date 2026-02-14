"use client";

import { useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@dreamhub/design-system";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface AudioPlayerProps {
  /** Duration in seconds */
  duration: number;
  /** Whether this thought has audio */
  hasAudio: boolean;
  className?: string;
}

const SPEED_OPTIONS = [1, 1.5, 2] as const;

/** Generate deterministic pseudo-random bars from a seed */
function generateBars(seed: number): number[] {
  const bars: number[] = [];
  let s = seed;
  for (let i = 0; i < 40; i++) {
    s = (s * 16807 + 7) % 2147483647;
    bars.push(0.2 + (s % 1000) / 1250);
  }
  return bars;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  duration,
  hasAudio,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [position, setPosition] = useState(0);

  if (!hasAudio || duration <= 0) return null;

  const speed = SPEED_OPTIONS[speedIndex];
  const bars = generateBars(Math.round(duration * 100));
  const progress = duration > 0 ? position / duration : 0;

  function handlePlayPause() {
    setIsPlaying(!isPlaying);
    // Actual audio playback would go here when audioUrl is available
  }

  function handleSpeedToggle() {
    setSpeedIndex((i) => (i + 1) % SPEED_OPTIONS.length);
  }

  return (
    <div
      className={cn(
        "rounded-[var(--dream-radius-lg)] bg-white/[0.04] border border-white/[0.06] p-4",
        className,
      )}
    >
      {/* Waveform */}
      <WaveformVisualizer
        bars={bars}
        playbackPosition={progress}
        height={48}
        className="mb-3"
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Play/Pause */}
        <button
          type="button"
          onClick={handlePlayPause}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--dream-color-primary)] text-white transition-transform active:scale-95"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-white" />
          ) : (
            <Play className="h-5 w-5 fill-white ml-0.5" />
          )}
        </button>

        {/* Timer */}
        <span className="text-xs font-mono text-gray-400">
          {formatTime(position)} / {formatTime(duration)}
        </span>

        {/* Speed toggle */}
        <button
          type="button"
          onClick={handleSpeedToggle}
          className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/[0.06]"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
}
