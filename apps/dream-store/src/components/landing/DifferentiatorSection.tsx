"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

/* ---------- Mock UI visuals for each row ---------- */

function StoryPageMockup() {
  return (
    <div className="space-y-3">
      {/* Mock story header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400" />
        <div>
          <div className="h-3 w-24 rounded bg-[#2563EB]/20" />
          <div className="mt-1.5 h-2 w-16 rounded bg-neutral-200" />
        </div>
      </div>
      {/* Mock story card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 aspect-[16/9] rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100" />
        <div className="space-y-2">
          <div className="h-3 w-3/4 rounded bg-neutral-200" />
          <div className="h-3 w-full rounded bg-neutral-100" />
          <div className="h-3 w-2/3 rounded bg-neutral-100" />
        </div>
      </div>
      {/* Product preview */}
      <div className="flex gap-2">
        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100" />
        <div className="flex-1 space-y-1.5 pt-1">
          <div className="h-2.5 w-20 rounded bg-neutral-200" />
          <div className="h-2 w-14 rounded bg-neutral-100" />
          <div className="h-3 w-10 rounded bg-[#2563EB]/20" />
        </div>
      </div>
    </div>
  );
}

function ProgressMockup() {
  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#2563EB]">72% funded</span>
          <span className="text-xs text-neutral-400">$7,200 / $10,000</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#EEF2FF]">
          <div className="h-full w-[72%] rounded-full bg-[#2563EB]" />
        </div>
      </div>
      {/* Milestones */}
      <div className="space-y-3">
        {[
          { label: "First prototype shipped", done: true },
          { label: "100 supporters reached", done: true },
          { label: "Launch version 2.0", done: false },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                m.done
                  ? "bg-[#2563EB] text-white"
                  : "border-2 border-neutral-300 text-neutral-400"
              }`}
            >
              {m.done ? "\u2713" : i + 1}
            </div>
            <span
              className={`text-sm ${
                m.done
                  ? "font-medium text-[#171717]"
                  : "text-neutral-400"
              }`}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupporterWallMockup() {
  return (
    <div className="space-y-3">
      {/* Avatar grid */}
      <div className="flex flex-wrap gap-2">
        {[
          "from-blue-300 to-blue-500",
          "from-emerald-300 to-teal-500",
          "from-amber-300 to-orange-500",
          "from-purple-300 to-violet-500",
          "from-pink-300 to-rose-500",
          "from-cyan-300 to-sky-500",
          "from-lime-300 to-green-500",
          "from-red-300 to-rose-400",
          "from-indigo-300 to-blue-500",
          "from-yellow-300 to-amber-500",
          "from-teal-300 to-emerald-500",
          "from-violet-300 to-purple-500",
        ].map((g, i) => (
          <div
            key={i}
            className={`h-9 w-9 rounded-full bg-gradient-to-br ${g}`}
          />
        ))}
      </div>
      {/* Comment preview */}
      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400" />
          <div className="h-2.5 w-16 rounded bg-neutral-200" />
        </div>
        <div className="mt-2 space-y-1">
          <div className="h-2 w-full rounded bg-neutral-100" />
          <div className="h-2 w-3/4 rounded bg-neutral-100" />
        </div>
      </div>
      <p className="text-center text-xs font-medium text-[#2563EB]">
        312 supporters and counting
      </p>
    </div>
  );
}

/* ---------- Row data ---------- */

const ROWS = [
  {
    title: "Stories before products",
    description:
      "Every item comes with the dreamer's journey. You know exactly who you're supporting and why.",
    visual: <StoryPageMockup />,
  },
  {
    title: "Transparent impact",
    description:
      "See exactly where your money goes. Track the dreamer's progress. Watch dreams come to life.",
    visual: <ProgressMockup />,
  },
  {
    title: "Community, not customers",
    description:
      "You're not a buyer — you're a supporter. Join a community that celebrates dreams together.",
    visual: <SupporterWallMockup />,
  },
];

/* ---------- Component ---------- */

export function DifferentiatorSection() {
  return (
    <section className="bg-white py-[120px] max-md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <DiffHeader />

        {/* Zigzag rows */}
        <div className="mt-16 space-y-20">
          {ROWS.map((row, i) => (
            <DiffRow key={i} index={i} {...row} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DiffHeader() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-600 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-[30px] opacity-0"
      }`}
    >
      <h2
        className="text-[32px] font-bold text-[#171717]"
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      >
        Not just a store.
      </h2>
      <p className="mt-3 text-base text-[#737373]">
        A new way to shop with purpose.
      </p>
    </div>
  );
}

function DiffRow({
  index,
  title,
  description,
  visual,
}: {
  index: number;
  title: string;
  description: string;
  visual: React.ReactNode;
}) {
  const { ref, isVisible } = useScrollReveal();
  const isReversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 transition-all duration-600 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-[30px] opacity-0"
      }`}
    >
      {/* Text */}
      <div className={isReversed ? "lg:order-2" : ""}>
        <h3
          className="mb-4 text-2xl font-semibold text-[#171717]"
          style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-base leading-[1.7] text-[#525252]">{description}</p>
      </div>

      {/* Visual */}
      <div className={isReversed ? "lg:order-1" : ""}>
        <div className="rounded-2xl bg-[#EEF2FF] p-8">{visual}</div>
      </div>
    </div>
  );
}
