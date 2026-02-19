"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const STATS = [
  { value: 10000, label: "Dreamers Connected", suffix: "+" },
  { value: 120, label: "Countries", suffix: "+" },
  { value: 2500, label: "Projects Started", suffix: "+" },
] as const;

function useCountUp(target: number, shouldStart: boolean, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let frame: number;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, shouldStart, duration]);

  return shouldStart ? count : 0;
}

function StatItem({
  value,
  label,
  suffix,
  shouldAnimate,
  delay,
  reducedMotion,
}: {
  value: number;
  label: string;
  suffix: string;
  shouldAnimate: boolean;
  delay: number;
  reducedMotion: boolean;
}) {
  const count = useCountUp(value, shouldAnimate);
  const displayValue = reducedMotion
    ? value.toLocaleString()
    : count.toLocaleString();

  return (
    <div
      className={`text-center ${
        shouldAnimate || reducedMotion
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
      style={
        !reducedMotion
          ? {
              transition: `opacity 400ms ease ${delay}ms, transform 400ms ease ${delay}ms`,
            }
          : undefined
      }
    >
      <span className="font-display text-[48px] font-bold leading-none text-[#6C3CE1]">
        {displayValue}
        {suffix}
      </span>
      <p className="mt-2 text-base text-neutral-500">{label}</p>
    </div>
  );
}

export function SocialProof() {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const reducedMotion = useReducedMotion();

  return (
    <section className="bg-white px-6 py-20 md:px-8 md:py-28">
      <div
        ref={ref}
        className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-3 md:gap-8"
      >
        {STATS.map((stat, i) => (
          <StatItem
            key={stat.label}
            value={stat.value}
            label={stat.label}
            suffix={stat.suffix}
            shouldAnimate={isInView}
            delay={i * 100}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </section>
  );
}
