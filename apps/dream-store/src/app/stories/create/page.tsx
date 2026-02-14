import type { Metadata } from "next";
import { CreateDreamStoryForm } from "./CreateDreamStoryForm";

export const metadata: Metadata = {
  title: "Create Your Dream Story | Dream Store",
  description:
    "Share your dream with the world. Tell your story, set your milestones, and let supporters join your journey.",
};

export default function CreateDreamStoryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Start Your Dream
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Every great journey begins with a single step. Tell the world what
            you&apos;re building and why it matters.
          </p>
        </div>

        <CreateDreamStoryForm />
      </div>
    </main>
  );
}
