"use client";

// ---------------------------------------------------------------------------
// ParallaxSection — Reusable Parallax Scroll Wrapper
//
// Uses Intersection Observer to detect viewport entry and applies a CSS
// transform with scroll offset for a smooth parallax effect. GPU-accelerated
// via will-change: transform.
//
// Spec reference: PART 0, Section 0.5 (Micro-Interactions)
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export interface ParallaxSectionProps {
  /** Content to render inside the parallax container */
  children: ReactNode;
  /** Parallax speed factor (0.1 = subtle, 0.5 = pronounced). Default: 0.2 */
  speed?: number;
  /** Additional CSS classes for the outer wrapper */
  className?: string;
}

export function ParallaxSection({
  children,
  speed = 0.2,
  className = "",
}: ParallaxSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number>(0);

  // Clamp speed to valid range
  const clampedSpeed = Math.max(0.1, Math.min(0.5, speed));

  // Handle scroll to calculate parallax offset
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !isVisible) return;

    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far through the viewport the element has scrolled
      // Range: -1 (fully below viewport) to 1 (fully above viewport)
      const scrollProgress =
        (windowHeight - rect.top) / (windowHeight + rect.height);

      // Center the range so parallax is 0 when element is centered
      const centeredProgress = (scrollProgress - 0.5) * 2;

      // Apply speed factor to get final offset in pixels
      const maxOffset = rect.height * clampedSpeed;
      setOffset(centeredProgress * maxOffset);
    });
  }, [isVisible, clampedSpeed]);

  // Intersection Observer to detect viewport entry/exit
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: "50px 0px",
        threshold: 0,
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Attach/detach scroll listener based on visibility
  useEffect(() => {
    if (isVisible) {
      // Calculate initial offset
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isVisible, handleScroll]);

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const translateY = prefersReducedMotion ? 0 : offset;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
    >
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          willChange: isVisible ? "transform" : "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
