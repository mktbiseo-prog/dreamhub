"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const DREAMERS = [
  {
    id: "1",
    photo: "from-blue-200 to-indigo-300",
    statement:
      "I'm building accessible education tools for rural children who can't afford private tutoring.",
    name: "Sarah Kim",
    location: "Seoul, Korea",
    progress: 72,
    supporters: 234,
    avatar: "from-blue-400 to-indigo-500",
  },
  {
    id: "2",
    photo: "from-amber-200 to-orange-300",
    statement:
      "Creating sustainable fashion from ocean waste — turning pollution into beautiful, wearable art.",
    name: "James Chen",
    location: "San Francisco, USA",
    progress: 58,
    supporters: 189,
    avatar: "from-amber-400 to-orange-500",
  },
  {
    id: "3",
    photo: "from-emerald-200 to-teal-300",
    statement:
      "Developing a free mental health app that gives teens safe spaces to talk without judgment.",
    name: "Maya Patel",
    location: "London, UK",
    progress: 84,
    supporters: 312,
    avatar: "from-emerald-400 to-teal-500",
  },
];

export function FeaturedDreamers() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="bg-[#FAFAFA] py-[120px] max-md:py-20" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`mb-12 text-center transition-all duration-600 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-[30px] opacity-0"
          }`}
        >
          <h2
            className="text-[32px] font-bold text-[#171717]"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
          >
            Dreams in Progress
          </h2>
          <p className="mt-3 text-base text-[#737373]">
            Real people. Real dreams. Your support makes them possible.
          </p>
        </div>

        {/* Cards — horizontal scroll on mobile, row on desktop */}
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
          {DREAMERS.map((dreamer, i) => (
            <div
              key={dreamer.id}
              className={`w-[320px] shrink-0 lg:w-auto transition-all duration-600 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-[30px] opacity-0"
              }`}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                {/* Creator photo area */}
                <div
                  className={`aspect-[3/2] bg-gradient-to-br ${dreamer.photo}`}
                />

                {/* Content */}
                <div className="p-6">
                  {/* Dream statement */}
                  <p className="mb-4 text-lg font-semibold leading-snug text-[#171717]">
                    &ldquo;{dreamer.statement}&rdquo;
                  </p>

                  {/* Creator info */}
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-full bg-gradient-to-br ${dreamer.avatar}`}
                    />
                    <div>
                      <p className="text-sm font-medium text-[#171717]">
                        {dreamer.name}
                      </p>
                      <p className="text-xs text-[#737373]">
                        {dreamer.location}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-[#EEF2FF]">
                    <div
                      className="h-full rounded-full bg-[#2563EB] transition-all duration-1000"
                      style={{
                        width: isVisible ? `${dreamer.progress}%` : "0%",
                        transitionDelay: `${800 + i * 200}ms`,
                      }}
                    />
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#2563EB]">
                      {dreamer.progress}% funded
                    </span>
                    <span className="text-xs text-[#A3A3A3]">
                      {dreamer.supporters} supporters
                    </span>
                  </div>

                  {/* Link */}
                  <Link
                    href={`/stories/${dreamer.id}`}
                    className="text-sm font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
                  >
                    Read Their Story &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
