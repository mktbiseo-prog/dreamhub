"use client";

import Link from "next/link";
import { cn } from "@dreamhub/ui";
import { useInView } from "@/hooks/useInView";

export function FinalCTA() {
  const { ref, inView } = useInView({ threshold: 0.3 });

  return (
    <section
      ref={ref}
      className="mx-auto max-w-3xl px-6 py-12 text-center md:px-8 lg:py-20"
    >
      <h2
        className={cn(
          "text-3xl font-bold leading-tight text-neutral-900 transition-all duration-300 ease-out dark:text-neutral-50 md:text-4xl",
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      >
        Your dream is waiting.
        <br />
        Start now.
      </h2>

      <p
        className={cn(
          "mx-auto mt-4 max-w-md text-base text-neutral-500 transition-all delay-100 duration-300 ease-out dark:text-neutral-400",
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        Join thousands of dreamers who turned their ideas into reality with a
        guided, AI-powered plan.
      </p>

      <div
        className={cn(
          "mt-8 transition-all delay-200 duration-300 ease-out",
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        <Link href="/onboarding">
          <button
            type="button"
            className="h-14 rounded-lg bg-[#FF6B35] px-8 text-lg font-bold text-white transition-colors hover:bg-[#E85A24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2"
          >
            Start Your Journey
          </button>
        </Link>
      </div>
    </section>
  );
}
