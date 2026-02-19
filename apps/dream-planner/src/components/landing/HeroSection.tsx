"use client";

import Link from "next/link";
import { LifeCalendarCanvas } from "./LifeCalendarCanvas";
import { ScrollIndicator } from "./ScrollIndicator";
import {
  DEFAULT_AGE,
  percentLived,
  weeksRemaining,
} from "@/lib/life-calendar";

export function HeroSection() {
  const age = DEFAULT_AGE;

  return (
    <section className="relative flex min-h-screen flex-col lg:flex-row">
      {/* 3D Life Calendar */}
      <div className="flex flex-1 items-center justify-center p-4 lg:p-8">
        <LifeCalendarCanvas
          age={age}
          className="h-[50vh] w-full lg:h-[80vh]"
        />
      </div>

      {/* Text + CTA */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-4 lg:items-start lg:px-16 lg:pb-0 lg:pt-0">
        <h1
          className="text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-neutral-900 dark:text-neutral-50 md:text-5xl lg:text-[48px]"
          style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        >
          Your life in weeks.
        </h1>

        {/* Stats */}
        <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold text-[#FF6B35]">
            {percentLived(age)}%
          </span>{" "}
          already lived.{" "}
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {weeksRemaining(age).toLocaleString()}
          </span>{" "}
          weeks remaining.
        </p>

        <p className="mt-3 max-w-md text-base leading-relaxed text-neutral-500 dark:text-neutral-400">
          5,200 weeks. That&apos;s all you get. Make each one count.
        </p>

        {/* CTA */}
        <Link href="/onboarding" className="mt-10">
          <button
            type="button"
            className="h-14 rounded-lg bg-[#FF6B35] px-8 text-lg font-bold text-white transition-colors hover:bg-[#E85A24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2"
          >
            Start Your Journey
          </button>
        </Link>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
}
