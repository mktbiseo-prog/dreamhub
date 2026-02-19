"use client";

import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const STEPS = [
  {
    number: "01",
    title: "Tell us your dream",
    description:
      "Create your profile and share your dream. Our AI enriches it to find the best matches.",
  },
  {
    number: "02",
    title: "Get matched daily",
    description:
      "Every day, receive 8-12 curated matches — dreamers with complementary skills and aligned visions.",
  },
  {
    number: "03",
    title: "Build together",
    description:
      "Start a trial project, validate the fit, and form a dream team to make it real.",
  },
] as const;

export function HowItWorks() {
  const { ref, isInView } = useInView({ threshold: 0.15 });
  const reducedMotion = useReducedMotion();
  const animate = isInView || reducedMotion;

  return (
    <section className="bg-[#F5F1FF] px-6 py-20 md:px-8 md:py-28">
      <div ref={ref} className="mx-auto max-w-[1200px]">
        <h2
          className={`text-center font-display text-2xl font-bold tracking-[-0.01em] text-neutral-900 md:text-[32px] ${
            animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={
            !reducedMotion
              ? { transition: "opacity 400ms ease, transform 400ms ease" }
              : undefined
          }
        >
          How it works
        </h2>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`text-center ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={
                !reducedMotion
                  ? {
                      transition: `opacity 400ms ease ${150 + i * 100}ms, transform 400ms ease ${150 + i * 100}ms`,
                    }
                  : undefined
              }
            >
              <span className="font-display text-[48px] font-bold leading-none text-[#6C3CE1]">
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
