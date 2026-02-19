"use client";

import Link from "next/link";
import { PenTool, Package, Heart } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const STEPS = [
  {
    num: 1,
    icon: PenTool,
    title: "Tell your story",
    description: "Share your dream journey and what drives you every day.",
  },
  {
    num: 2,
    icon: Package,
    title: "List your products",
    description: "Add the products or services born from your dream.",
  },
  {
    num: 3,
    icon: Heart,
    title: "Get supported",
    description: "Connect with supporters who believe in your dream.",
  },
];

export function BecomeDreamerSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="bg-white py-[120px] max-md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — Text + CTA */}
          <div
            className={`transition-all duration-600 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-[30px] opacity-0"
            }`}
          >
            <h2
              className="mb-4 text-[32px] font-bold leading-tight text-[#171717]"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
            >
              Have a dream?
              <br />
              Share it with the world.
            </h2>
            <p className="mb-8 max-w-md text-base leading-[1.7] text-[#525252]">
              List your products, tell your story, and let supporters fuel your
              journey. It&apos;s free to start.
            </p>
            <Link
              href="/stories/create"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-[#2563EB] px-10 text-lg font-bold text-white shadow-[0_2px_12px_rgba(37,99,235,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-[0_4px_20px_rgba(37,99,235,0.3)]"
            >
              Become a Dreamer
            </Link>
          </div>

          {/* Right — 3 steps */}
          <div className="relative space-y-10">
            {/* Dotted connector line */}
            <div
              className="absolute left-5 top-8 bottom-8 w-px border-l-2 border-dashed border-neutral-200 max-lg:hidden"
              aria-hidden="true"
            />

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className={`relative flex items-start gap-5 transition-all duration-600 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-[30px] opacity-0"
                  }`}
                  style={{ transitionDelay: `${400 + i * 200}ms` }}
                >
                  {/* Number circle */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                    {step.num}
                  </div>

                  {/* Content */}
                  <div className="pt-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Icon size={18} className="text-[#2563EB]" strokeWidth={2} />
                      <h3 className="text-lg font-semibold text-[#171717]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-[#525252]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
