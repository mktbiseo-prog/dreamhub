"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@dreamhub/ui";
import { LifeCalendarGrid, type HoverInfo } from "./LifeCalendarGrid";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface LifeCalendarCanvasProps {
  age: number;
  className?: string;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function LifeCalendarCanvas({
  age,
  className,
}: LifeCalendarCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [tooltip, setTooltip] = useState<HoverInfo | null>(null);

  // Detect dark mode
  useEffect(() => {
    const html = document.documentElement;
    setDarkMode(html.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setDarkMode(html.classList.contains("dark"));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const handleHoverCell = useCallback((info: HoverInfo | null) => {
    setTooltip(info);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
    >
      <LifeCalendarGrid
        age={age}
        darkMode={darkMode}
        onHoverCell={handleHoverCell}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: tooltip.x - (wrapperRef.current?.getBoundingClientRect().left ?? 0) + 16,
            top: tooltip.y - (wrapperRef.current?.getBoundingClientRect().top ?? 0) - 16,
          }}
        >
          <div className="rounded-lg bg-[#171717] px-3.5 py-2 shadow-lg">
            <p className="text-xs font-semibold text-white">{tooltip.label}</p>
            <p className="mt-0.5 text-[10px] text-neutral-400">{tooltip.subtext}</p>
          </div>
        </div>
      )}
    </div>
  );
}
