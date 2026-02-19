"use client";

import { cn } from "@dreamhub/ui";
import { useInView } from "@/hooks/useInView";

const ITEMS = [
  {
    title: "Discover Yourself",
    description:
      "20 interactive activities to map your skills, passions, and resources. Understand where you really stand.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    title: "Plan With AI",
    description:
      "An AI coach guides you step-by-step, using Simon Squibb's proven methodology to shape your dream.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8z" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
  {
    title: "Take Action",
    description:
      "From $0 validation to your first revenue. A step-by-step launch guide that actually works.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
];

export function ValueProposition() {
  const { ref, inView } = useInView({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="mx-auto max-w-5xl px-6 py-16 md:px-8 lg:py-[120px]"
    >
      <div className="grid gap-8 md:grid-cols-3">
        {ITEMS.map((item, i) => (
          <div
            key={item.title}
            className={cn(
              "group rounded-2xl border border-neutral-100 bg-white p-7 text-center transition-all duration-500 ease-out dark:border-neutral-800 dark:bg-neutral-900",
              inView
                ? "translate-y-0 opacity-100"
                : "translate-y-[30px] opacity-0",
              "hover:-translate-y-0.5 hover:shadow-md",
            )}
            style={{
              transitionDelay: inView ? `${i * 120}ms` : "0ms",
            }}
          >
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF3ED] text-[#FF6B35] transition-transform duration-300 group-hover:scale-105">
              {item.icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#171717] dark:text-neutral-100">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
