import { HeroSection } from "@/components/landing/HeroSection";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <ValueProposition />
      <HowItWorks />
      <FinalCTA />

      <footer className="border-t border-gray-200 py-6 text-center dark:border-gray-800">
        <p className="text-xs text-gray-400">
          Dream Planner by Dream Hub &middot; Inspired by Simon Squibb
        </p>
      </footer>
    </main>
  );
}
