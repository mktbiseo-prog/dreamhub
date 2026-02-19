"use client";

import Link from "next/link";
import {
  Laptop,
  Palette,
  GraduationCap,
  Coffee,
  Heart,
  Scissors,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const CATEGORIES = [
  { name: "Tech & Apps", icon: Laptop, href: "/?category=Technology" },
  { name: "Art & Design", icon: Palette, href: "/?category=Art+%26+Craft" },
  { name: "Education", icon: GraduationCap, href: "/?category=Education" },
  { name: "Food & Drink", icon: Coffee, href: "/?category=Food+%26+Drink" },
  { name: "Social Impact", icon: Heart, href: "/?category=Social+Impact" },
  { name: "Handmade", icon: Scissors, href: "/?category=Art+%26+Craft" },
];

export function CategorySection() {
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
            Explore by dream
          </h2>
        </div>

        {/* Grid: 2 cols mobile, 3 cols desktop */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white p-6 text-center transition-all duration-300 hover:border-[#2563EB] hover:shadow-sm ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-[30px] opacity-0"
                }`}
                style={{
                  transitionDelay: `${150 + i * 80}ms`,
                  transitionProperty: "all",
                  transitionDuration: "600ms",
                }}
              >
                <Icon
                  className="text-[#2563EB] transition-transform duration-300 group-hover:scale-110"
                  size={32}
                  strokeWidth={1.5}
                />
                <span className="text-sm font-semibold text-[#171717]">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
