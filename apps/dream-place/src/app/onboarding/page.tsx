import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata = {
  title: "Create Your Dream Profile | Dream Place",
  description:
    "Share your dream, your skills, and find the perfect teammates to make it happen.",
};

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#6C3CE1]">
          Dream Place
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Create your dream profile
        </p>
      </div>
      <OnboardingWizard />
    </main>
  );
}
