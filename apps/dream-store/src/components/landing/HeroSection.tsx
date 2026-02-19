"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const FLOATING_SHAPES = [
  { size: 280, x: "8%", y: "12%", blur: 40, opacity: 0.15, delay: 0, duration: 20 },
  { size: 200, x: "72%", y: "18%", blur: 30, opacity: 0.12, delay: 3, duration: 18 },
  { size: 160, x: "88%", y: "55%", blur: 25, opacity: 0.15, delay: 6, duration: 22 },
  { size: 300, x: "3%", y: "65%", blur: 40, opacity: 0.1, delay: 2, duration: 25 },
  { size: 120, x: "42%", y: "8%", blur: 20, opacity: 0.14, delay: 5, duration: 16 },
  { size: 180, x: "58%", y: "72%", blur: 30, opacity: 0.12, delay: 8, duration: 23 },
  { size: 100, x: "28%", y: "45%", blur: 20, opacity: 0.16, delay: 4, duration: 19 },
];

const PRODUCT_CARDS = [
  {
    creator: "Sarah Kim",
    dream: "Building accessible education tools for rural children",
    price: "$49",
    progress: 72,
    supporters: 234,
    gradient: "from-blue-100 to-indigo-100",
  },
  {
    creator: "James Chen",
    dream: "Creating sustainable fashion from ocean waste",
    price: "$35",
    progress: 58,
    supporters: 189,
    gradient: "from-amber-50 to-orange-100",
  },
  {
    creator: "Maya Patel",
    dream: "Developing a mental health app for teens",
    price: "$29",
    progress: 84,
    supporters: 312,
    gradient: "from-emerald-50 to-teal-100",
  },
];

const FAN_POSITIONS = [
  { rotate: -6, scale: 0.92, tx: -20, ty: 0, opacity: 0.7, z: 1 },
  { rotate: 0, scale: 0.96, tx: 0, ty: -10, opacity: 0.85, z: 2 },
  { rotate: 3, scale: 1, tx: 0, ty: 0, opacity: 1, z: 3 },
];

export function HeroSection() {
  const [activeCard, setActiveCard] = useState(2);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % PRODUCT_CARDS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getCardStyle = useCallback(
    (index: number): React.CSSProperties => {
      const posIndex = ((index - activeCard + PRODUCT_CARDS.length) % PRODUCT_CARDS.length);
      const pos = FAN_POSITIONS[posIndex];
      return {
        transform: `rotate(${pos.rotate}deg) scale(${pos.scale}) translate(${pos.tx}px, ${pos.ty}px)`,
        opacity: pos.opacity,
        zIndex: pos.z,
        transition: "all 800ms cubic-bezier(0.4, 0, 0.2, 1)",
      };
    },
    [activeCard]
  );

  const anim = (delay: number) =>
    `transition-all duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`;

  return (
    <section className="relative min-h-screen overflow-hidden bg-white">
      {/* Floating blue shapes background */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {FLOATING_SHAPES.map((shape, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
              background: `radial-gradient(circle, rgba(37, 99, 235, ${shape.opacity}), transparent 70%)`,
              filter: `blur(${shape.blur}px)`,
              animation: `dream-float ${shape.duration}s ease-in-out infinite`,
              animationDelay: `${shape.delay}s`,
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-[1200px] items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left — Text content */}
          <div className="flex flex-col justify-center order-2 lg:order-1 pb-8 lg:pb-0 pt-8 lg:pt-0">
            {/* Badge */}
            <span
              className={`mb-6 inline-block w-fit rounded-full bg-[#EEF2FF] px-4 py-1.5 text-sm font-medium text-[#2563EB] ${anim(400)}`}
              style={{ transitionDelay: "400ms" }}
            >
              Story-Driven Commerce
            </span>

            {/* Headline */}
            <h1>
              <span
                className={`block text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[#171717] sm:text-[56px] ${anim(600)}`}
                style={{
                  transitionDelay: "600ms",
                  fontFamily: "var(--font-plus-jakarta), sans-serif",
                }}
              >
                Every purchase
              </span>
              <span
                className={`block text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[#2563EB] sm:text-[56px] ${anim(800)}`}
                style={{
                  transitionDelay: "800ms",
                  fontFamily: "var(--font-plus-jakarta), sans-serif",
                }}
              >
                supports a dream.
              </span>
            </h1>

            {/* Subhead */}
            <p
              className={`mt-5 max-w-[480px] text-lg leading-[1.7] text-[#525252] ${anim(1000)}`}
              style={{ transitionDelay: "1000ms" }}
            >
              Discover products with stories behind them. When you buy,
              you&apos;re not just getting something &mdash; you&apos;re fueling
              someone&apos;s dream.
            </p>

            {/* CTAs */}
            <div
              className={`mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4 ${anim(1200)}`}
              style={{ transitionDelay: "1200ms" }}
            >
              <Link
                href="/#explore"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-[#2563EB] px-10 text-lg font-bold text-white shadow-[0_2px_12px_rgba(37,99,235,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-[0_4px_20px_rgba(37,99,235,0.3)]"
              >
                Explore Dreams
              </Link>
              <Link
                href="/stories/create"
                className="inline-flex h-14 items-center justify-center rounded-xl border-[1.5px] border-[#2563EB] px-8 font-semibold text-[#2563EB] transition-all duration-200 hover:bg-[#EEF2FF]"
              >
                Share Your Dream
              </Link>
            </div>

            {/* Social proof */}
            <div
              className={`mt-8 flex items-center gap-3 ${anim(1400)}`}
              style={{ transitionDelay: "1400ms" }}
            >
              <div className="flex -space-x-2">
                {[
                  "from-blue-400 to-blue-600",
                  "from-emerald-400 to-teal-600",
                  "from-amber-400 to-orange-500",
                  "from-purple-400 to-violet-600",
                ].map((gradient, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br ${gradient}`}
                  />
                ))}
              </div>
              <p className="text-sm text-[#737373]">
                2,500+ dreamers already sharing their stories
              </p>
            </div>
          </div>

          {/* Right — Product Cards Fan */}
          <div
            className={`relative flex items-center justify-center order-1 lg:order-2 pt-24 lg:pt-0 transition-all duration-1000 ${
              isLoaded
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            <div className="relative h-[400px] w-[280px] sm:h-[420px] sm:w-[290px]">
              {PRODUCT_CARDS.map((card, i) => {
                const isFront =
                  ((i - activeCard + PRODUCT_CARDS.length) %
                    PRODUCT_CARDS.length) === 2;
                return (
                  <div
                    key={i}
                    className={`absolute inset-0 cursor-pointer rounded-2xl border border-neutral-100 bg-white shadow-xl transition-shadow duration-300 ${
                      isFront ? "hover:shadow-2xl" : ""
                    } ${i !== activeCard ? "hidden lg:block" : ""}`}
                    style={getCardStyle(i)}
                    onClick={() => setActiveCard(i)}
                  >
                    {/* Product image placeholder */}
                    <div
                      className={`aspect-[4/3] rounded-t-2xl bg-gradient-to-br ${card.gradient}`}
                    />
                    {/* Card content */}
                    <div className="p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
                        <span className="text-sm font-medium text-[#171717]">
                          {card.creator}
                        </span>
                      </div>
                      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[#525252]">
                        {card.dream}
                      </p>
                      <p className="mb-3 text-lg font-bold text-[#171717]">
                        {card.price}
                      </p>
                      <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-[#EEF2FF]">
                        <div
                          className="h-full rounded-full bg-[#2563EB]"
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#A3A3A3]">
                        {card.progress}% funded &middot; {card.supporters}{" "}
                        supporters
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-neutral-300 pt-1.5">
          <div className="h-2 w-1 rounded-full bg-neutral-300" />
        </div>
      </div>
    </section>
  );
}
