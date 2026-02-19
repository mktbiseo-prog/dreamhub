"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function SplineHero() {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Listen for load/error events from the spline-viewer web component
    const viewer = container.querySelector("spline-viewer");
    if (!viewer) return;

    const onLoad = () => setSplineLoaded(true);
    const onError = () => setSplineError(true);

    viewer.addEventListener("load", onLoad);
    viewer.addEventListener("error", onError);

    // Timeout fallback — if Spline hasn't loaded in 15s, show star field
    const timeout = setTimeout(() => {
      if (!splineLoaded) setSplineError(true);
    }, 15000);

    return () => {
      viewer.removeEventListener("load", onLoad);
      viewer.removeEventListener("error", onError);
      clearTimeout(timeout);
    };
  }, [splineLoaded]);

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#0F0F1A]">
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.12.58/build/spline-viewer.js"
        type="module"
        strategy="lazyOnload"
      />

      {/* Spline 3D Background */}
      {!splineError && (
        <div ref={containerRef} className="absolute inset-0 z-0">
          {/* @ts-expect-error — spline-viewer is a web component loaded via script */}
          <spline-viewer
            url="https://prod.spline.design/1MigA5o47Of6hLrK/scene.splinecode"
            loading-anim-type="none"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}

      {/* Loading shimmer / Star field fallback */}
      {!splineLoaded && (
        <div className="absolute inset-0 z-0">
          <div className="star-field absolute inset-0" />
          {!splineError && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-[#0F0F1A] via-[#1A1A2E] to-[#0F0F1A]" />
          )}
        </div>
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0F0F1A]/40 via-transparent to-[#0F0F1A]/70" />

      {/* Text overlay */}
      <div className="relative z-[2] flex w-full max-w-3xl flex-col items-center px-6 text-center md:px-8">
        <h1
          className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-[48px]"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
        >
          The universe is vast.
          <br />
          Your dream doesn&apos;t have to be alone.
        </h1>

        <p
          className="mt-5 max-w-lg text-base text-white/70 md:mt-6 md:text-lg"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.4)" }}
        >
          Find your perfect co-dreamer across borders.
        </p>

        <Link href="/auth/onboarding" className="mt-8 md:mt-10">
          <button
            className="h-14 rounded-lg bg-[#6C3CE1] px-8 text-lg font-bold text-white transition-colors duration-150 hover:bg-[#5429C7]"
            style={{ boxShadow: "0 4px 20px rgba(108, 60, 225, 0.4)" }}
          >
            Start Exploring
          </button>
        </Link>
      </div>

      {/* Scroll down indicator */}
      <div className="absolute bottom-8 left-1/2 z-[2] -translate-x-1/2">
        <ChevronDown
          className={`h-6 w-6 text-white/50 ${!reducedMotion ? "animate-bounce-scroll" : ""}`}
          strokeWidth={1.5}
        />
      </div>
    </section>
  );
}
