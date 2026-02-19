"use client";

import { Users, Rocket, Globe } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const CARDS = [
  {
    icon: Users,
    title: "Dream Matching",
    description:
      "AI finds the perfect co-dreamer — someone with the skills you need and a dream that aligns with yours.",
  },
  {
    icon: Rocket,
    title: "Trial Projects",
    description:
      "Start a 2-week trial project to see if you truly click before committing to a long-term team.",
  },
  {
    icon: Globe,
    title: "Global Network",
    description:
      "Connect with dreamers across borders. Your ideal teammate could be anywhere in the world.",
  },
] as const;

export function ValueProposition() {
  const { ref, isInView } = useInView({ threshold: 0.15 });
  const reducedMotion = useReducedMotion();
  const animate = isInView || reducedMotion;

  return (
    <section className="bg-white px-6 py-20 md:px-8 md:py-28">
      <div
        ref={ref}
        className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-3 md:gap-8"
      >
        {CARDS.map((card, i) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow duration-250 hover:shadow-md ${
              animate
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
            style={
              !reducedMotion
                ? {
                    transition: `opacity 400ms ease ${i * 100}ms, transform 400ms ease ${i * 100}ms, box-shadow 250ms ease`,
                  }
                : undefined
            }
          >
            <card.icon
              className="h-12 w-12 text-[#6C3CE1]"
              strokeWidth={1.5}
            />
            <h3 className="mt-4 text-lg font-semibold text-neutral-900">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
