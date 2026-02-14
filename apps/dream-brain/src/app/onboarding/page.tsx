export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { fetchOnboardingStatus } from "@/lib/queries";
import { getCurrentUserId } from "@/lib/auth";

export default async function OnboardingPage() {
  const userId = await getCurrentUserId();

  // Demo users skip onboarding
  if (userId === "demo-user") {
    redirect("/");
  }

  const completed = await fetchOnboardingStatus();
  if (completed) {
    redirect("/");
  }

  return <OnboardingWizard />;
}
