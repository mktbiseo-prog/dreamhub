"use client";

import Link from "next/link";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function FinalCTA() {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const reducedMotion = useReducedMotion();
  const animate = isInView || reducedMotion;

  return (
    <section className="bg-[#0F0F1A] px-6 py-24 md:px-8 md:py-32">
      <div
        ref={ref}
        className={`mx-auto max-w-2xl text-center ${
          animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={
          !reducedMotion
            ? { transition: "opacity 400ms ease, transform 400ms ease" }
            : undefined
        }
      >
        <h2 className="font-display text-2xl font-bold tracking-[-0.01em] text-white md:text-[32px]">
          Your co-dreamer is out there.
        </h2>
        <p className="mt-4 text-base text-white/60 md:text-lg">
          The universe brought you here. Take the next step.
        </p>
        <Link href="/auth/onboarding" className="mt-10 inline-block">
          <button
            className="h-14 rounded-lg bg-[#6C3CE1] px-10 text-lg font-bold text-white transition-colors duration-150 hover:bg-[#5429C7]"
            style={{ boxShadow: "0 4px 20px rgba(108, 60, 225, 0.4)" }}
          >
            Join Dream Place
          </button>
        </Link>
      </div>
    </section>
  );
}
