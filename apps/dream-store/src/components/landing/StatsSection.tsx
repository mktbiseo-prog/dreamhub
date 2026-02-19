"use client";

import { useState, useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const STATS = [
  { value: 2400000, prefix: "$", suffix: "+", label: "Dreams funded", display: "2.4M" },
  { value: 10000, prefix: "", suffix: "+", label: "Supporters worldwide", display: "10,000" },
  { value: 1200, prefix: "", suffix: "+", label: "Dreams launched", display: "1,200" },
];

function useCountUp(target: string, isVisible: boolean) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isVisible) return;

    // Parse target display string to get the number
    const numericStr = target.replace(/[^0-9.]/g, "");
    const hasM = target.includes("M");
    const targetNum = parseFloat(numericStr);

    const duration = 2000;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * targetNum;

      if (hasM) {
        setDisplay(current.toFixed(1) + "M");
      } else if (targetNum >= 1000) {
        setDisplay(Math.floor(current).toLocaleString());
      } else {
        setDisplay(Math.floor(current).toString());
      }

      if (progress >= 1) {
        setDisplay(target);
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, isVisible]);

  return display;
}

function StatItem({
  stat,
  isVisible,
  delay,
}: {
  stat: (typeof STATS)[number];
  isVisible: boolean;
  delay: number;
}) {
  const count = useCountUp(stat.display, isVisible);

  return (
    <div
      className={`text-center transition-all duration-600 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-[30px] opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="text-5xl font-bold text-white sm:text-[48px]">
        {stat.prefix}
        {count}
        {stat.suffix}
      </p>
      <p className="mt-2 text-base text-white/70">{stat.label}</p>
    </div>
  );
}

export function StatsSection() {
  const { ref, isVisible } = useScrollReveal(0.3);

  return (
    <section ref={ref} className="bg-[#2563EB] py-[100px] max-md:py-16">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        {STATS.map((stat, i) => (
          <StatItem
            key={stat.label}
            stat={stat}
            isVisible={isVisible}
            delay={200 + i * 200}
          />
        ))}
      </div>
    </section>
  );
}
