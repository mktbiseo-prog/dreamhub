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

const ContactShadows = dynamic(
  () =>
    import("@react-three/drei").then((mod) => ({
      default: mod.ContactShadows,
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
          camera={{
            position: [25, -30, 120],
            fov: 32,
            near: 0.1,
            far: 500,
          }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
          shadows
          style={{ background: "transparent" }}
          onCreated={({ gl: renderer }) => {
            renderer.toneMappingExposure = 1.2;
          }}
        >
          <LifeCalendar3D
            age={age}
            reducedMotion={reducedMotion}
            darkMode={darkMode}
            onHoverCell={handleHoverCell}
          />

          {/* Contact shadow beneath the grid */}
          <ContactShadows
            position={[0, -65, -1]}
            opacity={0.15}
            scale={120}
            blur={2}
            far={10}
          />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={40}
            maxDistance={300}
            enableDamping={true}
            dampingFactor={0.06}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
          />

          {/* Subtle fog for depth */}
          <fog attach="fog" args={[darkMode ? "#111111" : "#FAFAFA", 200, 400]} />
        </Canvas>
      </Suspense>

      {/* HTML tooltip overlay */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-xl border border-neutral-200/60 bg-white/90 px-4 py-2 text-xs font-semibold text-neutral-800 shadow-lg backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-900/90 dark:text-neutral-100"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}

// THREE is used for tone mapping enum
import * as THREE from "three";
