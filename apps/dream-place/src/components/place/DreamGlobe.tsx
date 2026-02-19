"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "@dreamhub/ui";
import type { GlobeDreamer } from "@/types";

interface DreamGlobeProps {
  dreamers: GlobeDreamer[];
  onRegionClick?: (region: string) => void;
}

// Category color map
const CATEGORY_COLORS: Record<string, string> = {
  Technology: "#8b5cf6",
  EdTech: "#3b82f6",
  "E-Commerce": "#10b981",
  HealthTech: "#ec4899",
  FinTech: "#f59e0b",
  "Climate Tech": "#22c55e",
  "Music Tech": "#a855f7",
  Productivity: "#6366f1",
  default: "#60a5fa",
};

// Region data with approximate screen positions (percentage-based)
const REGIONS: Array<{
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}> = [
  { name: "North America", x: 10, y: 20, width: 25, height: 30 },
  { name: "South America", x: 20, y: 55, width: 15, height: 30 },
  { name: "Europe", x: 42, y: 15, width: 16, height: 25 },
  { name: "Africa", x: 42, y: 40, width: 16, height: 35 },
  { name: "Asia", x: 58, y: 15, width: 30, height: 40 },
  { name: "Oceania", x: 75, y: 60, width: 15, height: 20 },
];

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.default;
}

function latLngToPosition(lat: number, lng: number): { x: number; y: number } {
  // Mercator-like projection to percentage positions
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

export function DreamGlobe({ dreamers, onRegionClick }: DreamGlobeProps) {
  const [rotation, setRotation] = useState(0);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => (r + 0.3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Dreamer positions
  const dreamerDots = useMemo(() => {
    return dreamers.map((d, i) => {
      const pos = latLngToPosition(d.lat, d.lng);
      return {
        ...d,
        ...pos,
        color: getCategoryColor(d.dreamCategory),
        key: `${d.name}-${i}`,
      };
    });
  }, [dreamers]);

  // Count dreamers per region
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const region of REGIONS) {
      counts[region.name] = dreamers.filter((d) => {
        const pos = latLngToPosition(d.lat, d.lng);
        return (
          pos.x >= region.x &&
          pos.x <= region.x + region.width &&
          pos.y >= region.y &&
          pos.y <= region.y + region.height
        );
      }).reduce((sum, d) => sum + d.count, 0);
    }
    return counts;
  }, [dreamers]);

  const handleRegionClick = useCallback(
    (region: string) => {
      setSelectedRegion(region);
      onRegionClick?.(region);
    },
    [onRegionClick],
  );

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-950">
      {/* Globe container with perspective */}
      <div
        className="relative aspect-[2/1] w-full overflow-hidden"
        style={{
          perspective: "800px",
        }}
      >
        {/* Rotating surface */}
        <div
          className="absolute inset-0"
          style={{
            transform: `rotateY(${rotation * 0.1}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Grid lines */}
          <svg
            className="absolute inset-0 h-full w-full opacity-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Latitude lines */}
            {[20, 40, 50, 60, 80].map((y) => (
              <line
                key={`lat-${y}`}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#4b5563"
                strokeWidth="0.2"
              />
            ))}
            {/* Longitude lines */}
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
              <line
                key={`lng-${x}`}
                x1={x}
                y1="0"
                x2={x}
                y2="100"
                stroke="#4b5563"
                strokeWidth="0.2"
              />
            ))}
          </svg>

          {/* Simplified continent shapes */}
          <svg
            className="absolute inset-0 h-full w-full opacity-30"
            viewBox="0 0 100 50"
            preserveAspectRatio="none"
          >
            {/* North America */}
            <path
              d="M10,8 L28,6 L30,14 L25,18 L20,22 L15,20 L12,16 Z"
              fill="#6366f1"
              opacity="0.4"
            />
            {/* South America */}
            <path
              d="M22,26 L28,24 L30,30 L28,38 L24,42 L20,36 Z"
              fill="#6366f1"
              opacity="0.4"
            />
            {/* Europe */}
            <path
              d="M44,6 L54,5 L56,10 L52,14 L46,12 Z"
              fill="#6366f1"
              opacity="0.4"
            />
            {/* Africa */}
            <path
              d="M44,16 L54,14 L56,22 L54,34 L48,36 L44,28 Z"
              fill="#6366f1"
              opacity="0.4"
            />
            {/* Asia */}
            <path
              d="M56,4 L82,6 L86,14 L80,22 L70,24 L62,18 L58,10 Z"
              fill="#6366f1"
              opacity="0.4"
            />
            {/* Oceania */}
            <path
              d="M78,30 L88,28 L90,34 L84,36 Z"
              fill="#6366f1"
              opacity="0.4"
            />
          </svg>

          {/* Dreamer dots */}
          {dreamerDots.map((dot) => (
            <div
              key={dot.key}
              className="absolute"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Pulse animation */}
              <div
                className="absolute h-6 w-6 animate-ping rounded-full opacity-20"
                style={{
                  backgroundColor: dot.color,
                  left: "-6px",
                  top: "-6px",
                }}
              />
              {/* Dot */}
              <div
                className="relative h-3 w-3 rounded-full shadow-lg"
                style={{ backgroundColor: dot.color }}
                title={`${dot.name} (${dot.dreamCategory}) - ${dot.count} dreamer${dot.count !== 1 ? "s" : ""}`}
              />
            </div>
          ))}

          {/* Region hover areas */}
          {REGIONS.map((region) => (
            <button
              key={region.name}
              type="button"
              className="absolute rounded transition-colors hover:bg-white/5"
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.width}%`,
                height: `${region.height}%`,
              }}
              onMouseEnter={() => setHoveredRegion(region.name)}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => handleRegionClick(region.name)}
            />
          ))}
        </div>

        {/* Hover tooltip */}
        {hoveredRegion && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-lg bg-neutral-800/90 px-3 py-2 text-sm text-white backdrop-blur-sm">
            <span className="font-medium">{hoveredRegion}</span>
            <span className="ml-2 text-neutral-300">
              {regionCounts[hoveredRegion] ?? 0} dreamer{(regionCounts[hoveredRegion] ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Selected region indicator */}
      {selectedRegion && (
        <div className="absolute bottom-4 left-4 right-4 z-10 rounded-lg bg-neutral-800/90 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{selectedRegion}</p>
              <p className="text-xs text-neutral-400">
                {regionCounts[selectedRegion] ?? 0} dreamer{(regionCounts[selectedRegion] ?? 0) !== 1 ? "s" : ""} in this region
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRegion(null)}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-700 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Category legend */}
      <div className="flex flex-wrap gap-2 p-3">
        {Object.entries(CATEGORY_COLORS)
          .filter(([key]) => key !== "default")
          .map(([category, color]) => (
            <div key={category} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-neutral-400">{category}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
