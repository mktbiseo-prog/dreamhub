"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function FinalCTASection() {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section ref={ref} className="bg-[#0F172A] py-[120px] max-md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 text-center sm:px-6 lg:px-8">
        <h2
          className={`text-4xl font-bold text-white sm:text-[48px] transition-all duration-600 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-[30px] opacity-0"
          }`}
          style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        >
          Every dream deserves a chance.
        </h2>
        <p
          className={`mx-auto mt-5 max-w-lg text-lg text-white/60 transition-all duration-600 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-[30px] opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          Start exploring. Start supporting. Start dreaming.
        </p>

        {/* CTAs */}
        <div
          className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-600 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-[30px] opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <Link
            href="/#explore"
            className="inline-flex h-14 items-center justify-center rounded-xl bg-[#2563EB] px-10 text-lg font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-[0_4px_20px_rgba(37,99,235,0.3)]"
          >
            Explore Dreams
          </Link>
          <Link
            href="/stories/create"
            className="inline-flex h-14 items-center justify-center rounded-xl border border-white/30 px-8 font-semibold text-white transition-all duration-200 hover:bg-white/10"
          >
            Share Your Dream
          </Link>
        </div>
      </div>
    </section>
  );
}
