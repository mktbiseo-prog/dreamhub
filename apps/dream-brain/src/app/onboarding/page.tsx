export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { fetchOnboardingStatus } from "@/lib/queries";
import { getCurrentUserId } from "@/lib/auth";

export default async function OnboardingPage() {
  try {
    const userId = await getCurrentUserId();

    // Demo users skip onboarding
    if (userId === "demo-user") {
      redirect("/");
    }

    const completed = await fetchOnboardingStatus();
    if (completed) {
      redirect("/");
    }
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as Record<string, unknown>).digest).startsWith("NEXT_REDIRECT")) throw e;
    // Database unavailable — show onboarding wizard with default state
  }

  return <OnboardingWizard />;
}
