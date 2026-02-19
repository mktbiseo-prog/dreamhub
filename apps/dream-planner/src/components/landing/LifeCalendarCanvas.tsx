"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@dreamhub/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Dynamic imports — R3F Canvas requires browser APIs
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false },
);

const LifeCalendar3D = dynamic(
  () =>
    import("./LifeCalendar3D").then((mod) => ({
      default: mod.LifeCalendar3D,
    })),
  { ssr: false },
);

const OrbitControls = dynamic(
  () =>
    import("@react-three/drei").then((mod) => ({
      default: mod.OrbitControls,
    })),
  { ssr: false },
);

/* ── Types ────────────────────────────────────────────────────────────────── */

interface LifeCalendarCanvasProps {
  age?: number;
  className?: string;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function LifeCalendarCanvas({
  age = 30,
  className,
}: LifeCalendarCanvasProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [tooltip, setTooltip] = useState<{
    label: string;
    x: number;
    y: number;
  } | null>(null);

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

  const handleHoverCell = useCallback(
    (label: string | null, screenX: number, screenY: number) => {
      if (!label) {
        setTooltip(null);
        return;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        label,
        x: screenX - rect.left + 14,
        y: screenY - rect.top - 8,
      });
    },
    [],
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 140], fov: 35, near: 0.1, far: 500 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <LifeCalendar3D
            age={age}
            reducedMotion={reducedMotion}
            darkMode={darkMode}
            onHoverCell={handleHoverCell}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={60}
            maxDistance={250}
            enableDamping={true}
            dampingFactor={0.08}
          />
        </Canvas>
      </Suspense>

      {/* HTML tooltip overlay */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}
