"use client";

// ---------------------------------------------------------------------------
// Confetti — Canvas-Based Celebration Animation
//
// Renders colorful confetti particles on a canvas overlay when activated.
// Uses requestAnimationFrame for smooth 60fps animation with physics
// simulation (gravity, air resistance, spin).
//
// Spec reference: PART 0, Section 0.5 (Micro-Interactions)
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ConfettiProps {
  /** Whether the confetti animation is currently active */
  active: boolean;
  /** Duration of the animation in milliseconds. Default: 3000 */
  duration?: number;
  /** Number of confetti particles. Default: 100 */
  particleCount?: number;
  /** Array of CSS color strings for particles */
  colors?: string[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  "#7C3AED", // purple-600
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#EC4899", // pink-500
  "#8B5CF6", // violet-500
  "#06B6D4", // cyan-500
];

const GRAVITY = 0.15;
const AIR_RESISTANCE = 0.99;
const FADE_DURATION_RATIO = 0.3; // Start fading at 70% of duration

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function createParticle(
  canvasWidth: number,
  colors: string[],
): Particle {
  return {
    x: randomRange(0, canvasWidth),
    y: randomRange(-20, -100),
    vx: randomRange(-4, 4),
    vy: randomRange(1, 5),
    width: randomRange(4, 10),
    height: randomRange(6, 14),
    rotation: randomRange(0, Math.PI * 2),
    rotationSpeed: randomRange(-0.1, 0.1),
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 1,
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export function Confetti({
  active,
  duration = 3000,
  particleCount = 100,
  colors = DEFAULT_COLORS,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate global opacity for fade-out
      const fadeStart = 1 - FADE_DURATION_RATIO;
      const globalOpacity =
        progress > fadeStart
          ? 1 - (progress - fadeStart) / FADE_DURATION_RATIO
          : 1;

      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Physics update
        p.vy += GRAVITY;
        p.vx *= AIR_RESISTANCE;
        p.vy *= AIR_RESISTANCE;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = globalOpacity;

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      }

      // Continue animation if not complete
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [duration],
  );

  // Start/stop animation when active changes
  useEffect(() => {
    if (!active) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      // Clear canvas on deactivation
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to fill container
    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Create particles
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(canvas.width, colors),
    );

    // Start animation
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [active, particleCount, colors, animate]);

  // Respect reduced motion preferences
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches && rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
