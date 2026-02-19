import { SplineHero } from "@/components/landing/SplineHero";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SocialProof } from "@/components/landing/SocialProof";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <SplineHero />
      <ValueProposition />
      <HowItWorks />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </main>
  );
}
