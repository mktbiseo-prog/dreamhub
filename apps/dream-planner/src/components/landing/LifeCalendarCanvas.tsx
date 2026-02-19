"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@dreamhub/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LifeCalendarGrid, type HoverInfo } from "./LifeCalendarGrid";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface LifeCalendarCanvasProps {
  age: number;
  className?: string;
  onRevealProgress?: (progress: number) => void;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function LifeCalendarCanvas({
  age,
  className,
  onRevealProgress,
}: LifeCalendarCanvasProps) {
  const reducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
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

  // Mouse-follow tilt (CSS 3D perspective)
  useEffect(() => {
    if (reducedMotion) return;
    const wrapper = wrapperRef.current;
    const tilt = tiltRef.current;
    if (!wrapper || !tilt) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 → 1
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      const rotateY = nx * 6; // ±6 degrees
      const rotateX = -ny * 6;
      tilt.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      tilt.style.transform = "rotateX(8deg) rotateY(-3deg)";
    };

    wrapper.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      wrapper.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [reducedMotion]);

  const handleHoverCell = useCallback((info: HoverInfo | null) => {
    setTooltip(info);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      style={{ perspective: "1200px" }}
    >
      <div
        ref={tiltRef}
        className="h-full w-full"
        style={{
          transform: "rotateX(8deg) rotateY(-3deg)",
          transformStyle: "preserve-3d",
          transition: reducedMotion ? "none" : "transform 0.15s ease-out",
        }}
      >
        <LifeCalendarGrid
          age={age}
          darkMode={darkMode}
          onHoverCell={handleHoverCell}
          onRevealProgress={onRevealProgress}
        />
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20"
          style={{ left: tooltip.x - (wrapperRef.current?.getBoundingClientRect().left ?? 0) + 16, top: tooltip.y - (wrapperRef.current?.getBoundingClientRect().top ?? 0) - 16 }}
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
