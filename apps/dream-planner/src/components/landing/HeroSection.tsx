"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@dreamhub/ui";
import { LifeCalendarCanvas } from "./LifeCalendarCanvas";
import { ScrollIndicator } from "./ScrollIndicator";
import { percentLived, weeksRemaining, TOTAL_CELLS } from "@/lib/life-calendar";

/* ── Count-up hook ────────────────────────────────────────────────────────── */

function useCountUp(target: number, start: boolean, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) { setValue(0); return; }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return value;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function HeroSection() {
  const [age, setAge] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showAgeEdit, setShowAgeEdit] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [textVisible, setTextVisible] = useState(false);
  const [statsReady, setStatsReady] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  // Entrance animation sequence
  useEffect(() => {
    if (age === null) return;
    // Text fades in after a short delay
    const t1 = setTimeout(() => setTextVisible(true), 200);
    return () => clearTimeout(t1);
  }, [age]);

  const handleRevealProgress = useCallback((progress: number) => {
    if (progress >= 0.85 && !statsReady) {
      setStatsReady(true);
    }
  }, [statsReady]);

  const handleSubmitAge = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputValue, 10);
    if (parsed >= 1 && parsed <= 99) {
      setAge(parsed);
      setTextVisible(false);
      setStatsReady(false);
    }
  };

  const handleChangeAge = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(editValue, 10);
    if (parsed >= 1 && parsed <= 99) {
      setAge(parsed);
      setShowAgeEdit(false);
      setTextVisible(false);
      setStatsReady(false);
    }
  };

  const pct = age ? percentLived(age) : 0;
  const remaining = age ? weeksRemaining(age) : 0;
  const displayPct = useCountUp(pct, statsReady);
  const displayRemaining = useCountUp(remaining, statsReady, 1200);

  // Focus edit input when shown
  useEffect(() => {
    if (showAgeEdit) editRef.current?.focus();
  }, [showAgeEdit]);

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "#FAFAFA",
        backgroundImage:
          "radial-gradient(circle at 60% 40%, rgba(255,107,53,0.04) 0%, transparent 70%)",
      }}
    >
      {/* ── Age prompt overlay ──────────────────────────────────────── */}
      {age === null && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white dark:bg-neutral-950">
          <h1
            className="text-4xl font-bold tracking-[-0.03em] text-[#171717] dark:text-neutral-50 md:text-6xl"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
          >
            How old are you?
          </h1>
          <p className="mt-4 text-base text-neutral-400">
            We&apos;ll show you how much of your life is left.
          </p>
          <form
            onSubmit={handleSubmitAge}
            className="mt-10 flex items-center gap-4"
          >
            <input
              type="number"
              min={1}
              max={99}
              autoFocus
              placeholder="28"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-16 w-28 rounded-xl border-2 border-neutral-200 bg-white text-center text-4xl font-bold text-[#171717] outline-none transition-all placeholder:text-neutral-200 focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
            />
            <button
              type="submit"
              disabled={
                !inputValue ||
                parseInt(inputValue, 10) < 1 ||
                parseInt(inputValue, 10) > 99
              }
              className="h-16 rounded-xl bg-[#FF6B35] px-8 text-lg font-bold text-white transition-all hover:bg-[#E85A24] hover:shadow-lg disabled:opacity-30"
            >
              Show Me
            </button>
          </form>
        </div>
      )}

      {/* ── Hero content ───────────────────────────────────────────── */}
      {age !== null && (
        <div className="mx-auto flex h-screen max-w-[1440px] flex-col lg:flex-row">
          {/* Left — Text (45%) */}
          <div className="flex flex-shrink-0 flex-col justify-center px-6 pb-4 pt-16 lg:w-[45%] lg:px-16 lg:py-0">
            <div
              className={cn(
                "transition-all duration-700 ease-out",
                textVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0",
              )}
            >
              <h1
                className="text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-[#171717] dark:text-neutral-50 md:text-5xl lg:text-[56px]"
                style={{
                  fontFamily: "var(--font-plus-jakarta), sans-serif",
                }}
              >
                Your life
                <br />
                in weeks.
              </h1>

              {/* Stats */}
              <p
                className={cn(
                  "mt-6 text-lg text-neutral-600 transition-all delay-200 duration-700 ease-out dark:text-neutral-400",
                  textVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                )}
              >
                <span className="font-bold text-[#FF6B35]">
                  {displayPct}%
                </span>{" "}
                already lived.{" "}
                <span className="font-bold text-[#171717] dark:text-neutral-100">
                  {displayRemaining.toLocaleString()}
                </span>{" "}
                weeks remaining.
              </p>

              <p
                className={cn(
                  "mt-3 max-w-sm text-base leading-relaxed text-neutral-400 transition-all delay-300 duration-700 ease-out",
                  textVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                )}
              >
                {TOTAL_CELLS.toLocaleString()} weeks. That&apos;s all you get.
                Make each one count.
              </p>

              {/* CTA */}
              <div
                className={cn(
                  "mt-10 transition-all delay-500 duration-700 ease-out",
                  textVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                )}
              >
                <Link href="/onboarding">
                  <button
                    type="button"
                    className="h-14 rounded-xl bg-[#FF6B35] px-10 text-lg font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E85A24] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2"
                  >
                    Start Your Journey
                  </button>
                </Link>
              </div>

              {/* Change age link */}
              <div
                className={cn(
                  "mt-6 transition-all delay-700 duration-700 ease-out",
                  textVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0",
                )}
              >
                {!showAgeEdit ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditValue(String(age));
                      setShowAgeEdit(true);
                    }}
                    className="text-sm text-neutral-400 transition-colors hover:text-neutral-600 hover:underline"
                  >
                    Born in a different year? Change &rarr;
                  </button>
                ) : (
                  <form
                    onSubmit={handleChangeAge}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={editRef}
                      type="number"
                      min={1}
                      max={99}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-9 w-16 rounded-lg border border-neutral-200 bg-white text-center text-sm font-semibold text-[#171717] outline-none focus:border-[#FF6B35] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50"
                    />
                    <button
                      type="submit"
                      className="h-9 rounded-lg bg-[#FF6B35] px-4 text-xs font-bold text-white"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAgeEdit(false)}
                      className="text-xs text-neutral-400 hover:text-neutral-600"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right — Calendar (55%) */}
          <div className="flex min-h-0 flex-1 items-center justify-center p-4 lg:py-8 lg:pr-8">
            <LifeCalendarCanvas
              age={age}
              className="h-[55vh] w-full lg:h-[85vh]"
              onRevealProgress={handleRevealProgress}
            />
          </div>
        </div>
      )}

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAFAFA] to-transparent" />

      {/* Scroll indicator */}
      {age !== null && <ScrollIndicator />}
    </section>
  );
}
