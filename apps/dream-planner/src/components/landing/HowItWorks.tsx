"use client";

import { cn } from "@dreamhub/ui";
import { useInView } from "@/hooks/useInView";

const STEPS = [
  {
    step: 1,
    title: "Face Your Reality",
    description:
      "Map your skills, time, and resources honestly. Discover what you already have.",
    color: "#FF6B35",
    bgLight: "#FFF3ED",
    bgDark: "#2E1E15",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Design Your Dream",
    description:
      "Transform passions into a concrete plan. Validate ideas with $0 experiments.",
    color: "#8B5CF6",
    bgLight: "#EDE9FE",
    bgDark: "#1E1533",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8z" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Connect & Launch",
    description:
      "Find your first fans, build a support network, and launch your 90-day sprint.",
    color: "#06B6D4",
    bgLight: "#ECFEFF",
    bgDark: "#0E2A2E",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  const { ref, inView } = useInView({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="mx-auto max-w-5xl px-6 py-12 md:px-8 lg:py-20"
    >
      <h2
        className={cn(
          "mb-12 text-center text-2xl font-bold text-neutral-900 transition-all duration-300 ease-out dark:text-neutral-50 md:text-3xl",
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      >
        How It Works
      </h2>

      <div className="grid gap-8 md:grid-cols-3">
        {STEPS.map((item, i) => (
          <div
            key={item.step}
            className={cn(
              "relative rounded-2xl border border-neutral-100 p-6 transition-all duration-300 ease-out dark:border-neutral-800",
              inView
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0",
            )}
            style={{ transitionDelay: inView ? `${i * 120 + 100}ms` : "0ms" }}
          >
            {/* Step number */}
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: item.color }}
            >
              {item.step}
            </div>

            {/* Icon */}
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: item.bgLight,
                color: item.color,
              }}
            >
              {item.icon}
            </div>

            <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              {item.description}
            </p>

            {/* Connecting arrow (except last) */}
            {i < STEPS.length - 1 && (
              <div className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-neutral-300 dark:text-neutral-600 md:block">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
