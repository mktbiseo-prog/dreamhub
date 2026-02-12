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
        <h1 className="bg-gradient-to-r from-brand-500 to-blue-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Dream Place
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create your dream profile
        </p>
      </div>
      <OnboardingWizard />
    </main>
  );
}
