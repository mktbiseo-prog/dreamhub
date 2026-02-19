"use client";

import { useState } from "react";
import Link from "next/link";
import { LifeCalendarCanvas } from "./LifeCalendarCanvas";
import { ScrollIndicator } from "./ScrollIndicator";
import { percentLived, weeksRemaining, TOTAL_CELLS } from "@/lib/life-calendar";

export function HeroSection() {
  const [age, setAge] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputValue, 10);
    if (parsed >= 1 && parsed <= 99) {
      setAge(parsed);
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center">
      {/* Age prompt overlay */}
      {age === null && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 dark:bg-neutral-950/95">
          <h1
            className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-neutral-50 md:text-5xl"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
          >
            How old are you?
          </h1>
          <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
            Let&apos;s see how much of your life is left.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={99}
              autoFocus
              placeholder="28"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-14 w-24 rounded-lg border border-neutral-200 bg-white text-center text-3xl font-bold text-neutral-900 outline-none transition-colors placeholder:text-neutral-300 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder:text-neutral-600"
            />
            <button
              type="submit"
              disabled={!inputValue || parseInt(inputValue, 10) < 1 || parseInt(inputValue, 10) > 99}
              className="h-14 rounded-lg bg-[#FF6B35] px-6 text-lg font-bold text-white transition-colors hover:bg-[#E85A24] disabled:opacity-40 disabled:hover:bg-[#FF6B35]"
            >
              Show Me
            </button>
          </form>
        </div>
      )}

      {/* 3D Life Calendar — full-width centred */}
      <div className="relative w-full flex-1">
        <LifeCalendarCanvas
          age={age ?? 30}
          className="h-[70vh] w-full md:h-[75vh]"
        />

        {/* Overlay text + CTA on top of calendar */}
        {age !== null && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center pb-20">
            <div className="pointer-events-auto rounded-2xl bg-white/80 px-8 py-6 text-center backdrop-blur-sm dark:bg-neutral-900/80">
              <h1
                className="text-2xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-neutral-50 md:text-4xl"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
              >
                Your life in weeks.
              </h1>

              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 md:text-base">
                <span className="font-semibold text-[#FF6B35]">
                  {percentLived(age)}%
                </span>{" "}
                already lived.{" "}
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {weeksRemaining(age).toLocaleString()}
                </span>{" "}
                weeks remaining.
              </p>

              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500 md:text-sm">
                {(TOTAL_CELLS).toLocaleString()} weeks. That&apos;s all you get. Make each one count.
              </p>

              <div className="mt-5 flex items-center justify-center gap-3">
                <Link href="/onboarding">
                  <button
                    type="button"
                    className="h-12 rounded-lg bg-[#FF6B35] px-6 text-base font-bold text-white transition-colors hover:bg-[#E85A24] md:h-14 md:px-8 md:text-lg"
                  >
                    Start Your Journey
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => { setAge(null); setInputValue(""); }}
                  className="h-12 rounded-lg border border-neutral-200 px-4 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 md:h-14 md:px-6"
                >
                  Change Age
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  );
}
