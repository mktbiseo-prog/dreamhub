"use client";

import { cn } from "@dreamhub/ui";
import { useInView } from "@/hooks/useInView";

const STEPS = [
  {
    step: 1,
    title: "Face Your Reality",
    description:
      "Map your skills, time, and resources honestly. Discover what you already have to work with.",
    color: "#FF6B35",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Design Your Dream",
    description:
      "Transform passions into a concrete plan. Validate ideas with zero-cost experiments.",
    color: "#8B5CF6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8z" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Connect & Launch",
    description:
      "Find your first fans, build a support network, and launch your 90-day sprint plan.",
    color: "#06B6D4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="mx-auto max-w-5xl px-6 py-16 md:px-8 lg:py-[120px]"
    >
      <h2
        className={cn(
          "mb-16 text-center text-2xl font-bold tracking-[-0.02em] text-[#171717] transition-all duration-600 ease-out dark:text-neutral-50 md:text-3xl",
          inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        )}
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      >
        How It Works
      </h2>

      <div className="relative grid gap-10 md:grid-cols-3 md:gap-12">
        {/* Dotted connector line (desktop) */}
        <div className="pointer-events-none absolute left-0 right-0 top-8 hidden md:block">
          <div className="mx-auto flex items-center justify-between px-20">
            <div className="h-px flex-1 border-t-2 border-dashed border-neutral-200 dark:border-neutral-700" />
            <div className="mx-6 h-px flex-1 border-t-2 border-dashed border-neutral-200 dark:border-neutral-700" />
          </div>
        </div>

        {STEPS.map((item, i) => (
          <div
            key={item.step}
            className={cn(
              "relative flex flex-col items-center text-center transition-all duration-600 ease-out",
              inView
                ? "translate-y-0 opacity-100"
                : "translate-y-[30px] opacity-0",
            )}
            style={{
              transitionDelay: inView ? `${i * 150 + 150}ms` : "0ms",
            }}
          >
            {/* Step number circle */}
            <div
              className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-sm"
              style={{ backgroundColor: item.color }}
            >
              {item.step}
            </div>

            {/* Icon */}
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${item.color}12`,
                color: item.color,
              }}
            >
              {item.icon}
            </div>

            <h3 className="mb-2 text-lg font-semibold text-[#171717] dark:text-neutral-100">
              {item.title}
            </h3>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
