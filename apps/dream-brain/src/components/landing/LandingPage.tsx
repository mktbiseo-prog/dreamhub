"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Sparkles,
  GitBranch,
  ChevronDown,
  Brain,
  MapPin,
  ShoppingBag,
  CalendarDays,
} from "lucide-react";
import { NeuronParticleCanvas } from "./NeuronParticleCanvas";

// ---------------------------------------------------------------------------
// Shared scroll-reveal hook
// ---------------------------------------------------------------------------

function useScrollReveal<T extends HTMLElement>(
  threshold = 0.15
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

// ---------------------------------------------------------------------------
// Hero Section
// ---------------------------------------------------------------------------

function HeroSection() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 1500),
      setTimeout(() => setStage(3), 1800),
      setTimeout(() => setStage(4), 2100),
      setTimeout(() => setStage(5), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const fadeUp = (s: number) =>
    `transition-all duration-700 ease-out ${
      stage >= s
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-5"
    }`;

  const fadeCTA =
    stage >= 5
      ? "opacity-100 scale-100"
      : "opacity-0 scale-95";

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0A1628]">
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,212,170,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Particle canvas */}
      <NeuronParticleCanvas className="absolute inset-0 z-0" />

      {/* Text overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        {/* Headline */}
        <h1
          className="font-bold tracking-[-0.03em]"
          style={{ fontFamily: "var(--dream-font-display)" }}
        >
          <span
            className={`block text-4xl md:text-[56px] md:leading-[1.1] text-[#FAFAFA] ${fadeUp(1)}`}
            style={{ textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
          >
            Your thoughts,
          </span>
          <span
            className={`block text-4xl md:text-[56px] md:leading-[1.1] text-[#FAFAFA] ${fadeUp(2)}`}
            style={{ textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
          >
            organized by AI.
          </span>
        </h1>

        {/* Subhead */}
        <p
          className={`mt-4 max-w-[520px] text-base md:text-lg leading-relaxed text-white/60 ${fadeUp(3)}`}
        >
          Speak freely. Dream Brain listens, transcribes, and connects
          your ideas.
        </p>

        {/* Feature highlights */}
        <div
          className={`mt-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 ${fadeUp(4)}`}
        >
          {[
            { icon: Mic, label: "1-tap recording" },
            { icon: Sparkles, label: "AI auto-organize" },
            { icon: GitBranch, label: "Knowledge graph" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 text-sm text-white/70"
            >
              <Icon className="h-5 w-5 text-[#00D4AA]" strokeWidth={1.5} />
              {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/onboarding"
          className={`mt-10 inline-flex h-14 items-center justify-center rounded-xl bg-[#00D4AA] px-10 text-lg font-bold text-[#0A1628] transition-all duration-200 hover:bg-[#00B894] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(0,212,170,0.4)] ${fadeCTA}`}
        >
          Start Recording
        </a>

        {/* Helper text */}
        <p
          className={`mt-3 text-[13px] text-white/40 transition-opacity duration-700 ${
            stage >= 5 ? "opacity-100" : "opacity-0"
          }`}
        >
          No sign-up required. Record your first thought in seconds.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-white/30" strokeWidth={1.5} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 1: Features (3 cards)
// ---------------------------------------------------------------------------

const features = [
  {
    icon: Mic,
    title: "Capture Everything",
    desc: "One tap to record. AI transcribes in real-time. Your thoughts become searchable text instantly.",
  },
  {
    icon: Sparkles,
    title: "AI Organizes",
    desc: "No folders. No tags. AI automatically categorizes, summarizes, and extracts action items from every note.",
  },
  {
    icon: GitBranch,
    title: "Connect Ideas",
    desc: "Discover hidden connections between your thoughts. AI builds your personal knowledge graph that grows with you.",
  },
] as const;

function FeaturesSection() {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();

  return (
    <section className="bg-[#0A1628] py-20 md:py-[120px]">
      <div
        ref={ref}
        className="mx-auto max-w-[1200px] px-4 md:px-6"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`rounded-2xl border border-[#1E3355] bg-[#132039] p-8 transition-all duration-600 hover:-translate-y-0.5 hover:border-[#00D4AA]/30 hover:shadow-[0_8px_30px_rgba(0,212,170,0.1)] ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00D4AA]/10">
                  <Icon
                    className="h-8 w-8 text-[#00D4AA]"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#FAFAFA]">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#94A3B8]">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 2: Demo Visual (recording mockup)
// ---------------------------------------------------------------------------

// Pre-computed waveform bar values to avoid Math.random() during render
const waveBars = Array.from({ length: 40 }, (_, i) => ({
  height: 20 + Math.sin(i * 0.5) * 50 + ((i * 17 + 7) % 30),
  duration: 0.4 + ((i * 13 + 3) % 40) / 100,
}));

function DemoVisualSection() {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  const [typedLines, setTypedLines] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timers = [
      setTimeout(() => setTypedLines(1), 600),
      setTimeout(() => setTypedLines(2), 1400),
      setTimeout(() => setTypedLines(3), 2000),
      setTimeout(() => setTypedLines(4), 2600),
      setTimeout(() => setTypedLines(5), 3000),
      setTimeout(() => setTypedLines(6), 3400),
      setTimeout(() => setTypedLines(7), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const lineClass = (n: number) =>
    `transition-all duration-500 ${
      typedLines >= n
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-2"
    }`;

  return (
    <section className="bg-[#0F1D32] py-20 md:py-[120px]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <h2
          className="mb-4 text-center text-2xl font-bold text-[#FAFAFA] md:text-[32px] tracking-[-0.01em]"
          style={{ fontFamily: "var(--dream-font-display)" }}
        >
          See it in action
        </h2>
        <p className="mx-auto mb-12 max-w-md text-center text-sm text-[#94A3B8]">
          Record a thought, and watch AI transform it into organized knowledge.
        </p>

        {/* Mock device */}
        <div
          ref={ref}
          className={`relative mx-auto max-w-md rounded-3xl border border-[#1E3355] bg-[#132039] p-6 shadow-2xl transition-all duration-700 ${
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          {/* Recording indicator */}
          <div className={lineClass(1)}>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <span className="text-sm font-medium text-[#FAFAFA]">
                Recording...
              </span>
              <span className="ml-auto font-mono text-xs text-[#64748B]">
                0:23
              </span>
            </div>
          </div>

          {/* Waveform bars */}
          <div className={`mt-4 ${lineClass(2)}`}>
            <div className="flex h-8 items-end gap-[2px]">
              {waveBars.map((bar, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-gradient-to-t from-[#00D4AA] to-[#06B6D4]"
                  style={{
                    height: `${bar.height}%`,
                    animationName: visible ? "waveBar" : "none",
                    animationDuration: `${bar.duration}s`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDirection: "alternate",
                    animationDelay: `${i * 30}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="my-5 h-px bg-[#1E3355]" />

          {/* AI Summary */}
          <div className={lineClass(3)}>
            <div className="rounded-xl border-l-[3px] border-[#00D4AA] bg-[#1A2B4A] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles
                  className="h-4 w-4 text-[#00D4AA]"
                  strokeWidth={1.5}
                />
                <span className="text-xs font-semibold text-[#00D4AA]">
                  AI Summary
                </span>
              </div>
              <p className={`text-sm text-[#FAFAFA] leading-relaxed ${lineClass(4)}`}>
                &quot;You discussed 3 key ideas about your startup MVP and
                outlined next steps for the landing page.&quot;
              </p>
            </div>
          </div>

          {/* Action Items */}
          <div className={`mt-4 ${lineClass(5)}`}>
            <p className="mb-2 text-xs font-semibold text-[#94A3B8]">
              Action Items
            </p>
            {[
              "Research competitors",
              "Draft landing page copy",
              "Schedule meeting with Jay",
            ].map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-3 py-1.5 ${lineClass(5 + i)}`}
              >
                <div className="h-4 w-4 rounded border border-[#1E3355]" />
                <span className="text-sm text-[#FAFAFA]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 3: Stats
// ---------------------------------------------------------------------------

function useCountUp(target: string, visible: boolean): string {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (!visible) return;

    // Special cases for non-numeric targets
    if (target === "∞" || target.includes("sec") || target.includes("%")) {
      const steps = ["", target.charAt(0), target.slice(0, 2), target];
      let i = 0;
      const interval = setInterval(() => {
        i++;
        if (i >= steps.length) {
          clearInterval(interval);
          setDisplay(target);
          return;
        }
        setDisplay(steps[i]);
      }, 200);
      return () => clearInterval(interval);
    }

    setDisplay(target);
  }, [visible, target]);

  return display;
}

const stats = [
  { value: "< 1 sec", label: "Time to start recording" },
  { value: "95%+", label: "Transcription accuracy" },
  { value: "∞", label: "Ideas connected" },
] as const;

function StatItem({
  value,
  label,
  visible,
  delay,
}: {
  value: string;
  label: string;
  visible: boolean;
  delay: number;
}) {
  const display = useCountUp(value, visible);

  return (
    <div
      className={`text-center transition-all duration-600 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p
        className="text-5xl font-bold text-[#00D4AA]"
        style={{ fontFamily: "var(--dream-font-display)" }}
      >
        {display}
      </p>
      <p className="mt-2 text-sm text-[#94A3B8]">{label}</p>
    </div>
  );
}

function StatsSection() {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();

  return (
    <section className="bg-[#0A1628] py-20 md:py-[120px]">
      <div
        ref={ref}
        className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-4 md:grid-cols-3 md:px-6"
      >
        {stats.map((s, i) => (
          <StatItem
            key={s.label}
            value={s.value}
            label={s.label}
            visible={visible}
            delay={i * 150}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 4: Dream Hub Ecosystem
// ---------------------------------------------------------------------------

const ecosystem = [
  {
    name: "Dream Planner",
    icon: CalendarDays,
    color: "#FF6B35",
    current: false,
  },
  { name: "Dream Brain", icon: Brain, color: "#00D4AA", current: true },
  { name: "Dream Place", icon: MapPin, color: "#6C3CE1", current: false },
  {
    name: "Dream Store",
    icon: ShoppingBag,
    color: "#2563EB",
    current: false,
  },
] as const;

function EcosystemSection() {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();
  const [linesDrawn, setLinesDrawn] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setLinesDrawn(true), 800);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <section className="bg-[#0F1D32] py-20 md:py-[120px]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 text-center">
        <h2
          className={`text-2xl font-bold text-[#FAFAFA] md:text-[32px] tracking-[-0.01em] transition-all duration-600 ${
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
          ref={ref}
          style={{ fontFamily: "var(--dream-font-display)" }}
        >
          Part of the Dream Hub ecosystem
        </h2>
        <p
          className={`mt-3 text-sm text-[#94A3B8] transition-all duration-600 delay-150 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          Your Dream Brain insights flow into Dream Planner, Dream Place,
          and Dream Store.
        </p>

        {/* Service icons */}
        <div className="relative mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {/* SVG connecting lines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 800 120"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {/* Lines from Brain (center, index 1) to others */}
            {[0, 2, 3].map((targetIdx) => {
              const brainX = 400;
              const targetX = 100 + targetIdx * 200;
              return (
                <line
                  key={targetIdx}
                  x1={brainX}
                  y1={60}
                  x2={targetX}
                  y2={60}
                  stroke="#00D4AA"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  strokeOpacity={linesDrawn ? 0.4 : 0}
                  className="transition-all duration-1000"
                />
              );
            })}
          </svg>

          {ecosystem.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.name}
                className={`relative z-10 flex flex-col items-center gap-3 transition-all duration-600 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-2xl border ${
                    svc.current
                      ? "h-20 w-20 border-[#00D4AA]/40 bg-[#00D4AA]/10"
                      : "h-14 w-14 border-[#1E3355] bg-[#132039]"
                  }`}
                >
                  <Icon
                    className={svc.current ? "h-9 w-9" : "h-6 w-6"}
                    style={{ color: svc.color }}
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    svc.current ? "text-[#00D4AA]" : "text-[#64748B]"
                  }`}
                >
                  {svc.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 5: Final CTA
// ---------------------------------------------------------------------------

function FinalCTASection() {
  const [ref, visible] = useScrollReveal<HTMLDivElement>();

  return (
    <section
      className="py-20 md:py-[120px]"
      style={{
        background: "linear-gradient(to bottom, #0A1628, #132039)",
      }}
    >
      <div
        ref={ref}
        className={`mx-auto max-w-[1200px] px-4 text-center transition-all duration-700 ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <h2
          className="text-3xl font-bold text-[#FAFAFA] md:text-[40px] tracking-[-0.02em]"
          style={{ fontFamily: "var(--dream-font-display)" }}
        >
          Your brain never stops thinking.
        </h2>
        <p className="mt-4 text-lg text-white/60">
          Give it a second brain that keeps up.
        </p>

        <a
          href="/onboarding"
          className="mt-10 inline-flex h-14 items-center justify-center rounded-xl bg-[#00D4AA] px-10 text-lg font-bold text-[#0A1628] transition-all duration-200 hover:bg-[#00B894] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(0,212,170,0.4)]"
        >
          Start Recording — It&apos;s Free
        </a>

        <p className="mt-3 text-[13px] text-white/40">
          No account needed. Works offline.
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function LandingFooter() {
  return (
    <footer className="border-t border-[#1E3355] bg-[#0A1628] py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#00D4AA]" strokeWidth={1.5} />
          <span className="text-sm font-bold text-[#FAFAFA]">
            Dream Brain
          </span>
        </div>

        <nav className="flex gap-6 text-xs text-[#64748B]">
          <a href="/terms" className="hover:text-[#94A3B8] transition-colors">
            Terms
          </a>
          <a href="/privacy" className="hover:text-[#94A3B8] transition-colors">
            Privacy
          </a>
          <a href="/about" className="hover:text-[#94A3B8] transition-colors">
            About
          </a>
        </nav>

        <p className="text-xs text-[#64748B]">
          &copy; {new Date().getFullYear()} Dream Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Main Landing Page
// ---------------------------------------------------------------------------

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A1628]">
      <HeroSection />
      <FeaturesSection />
      <DemoVisualSection />
      <StatsSection />
      <EcosystemSection />
      <FinalCTASection />
      <LandingFooter />

    </div>
  );
}
