export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoryById } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { EditDreamStoryForm } from "./EditDreamStoryForm";

export const metadata: Metadata = {
  title: "Edit Your Dream Story | Dream Store",
  description: "Update your dream story, milestones, and more.",
};

interface PageProps {
  params: Promise<{ storyId: string }>;
}

export default async function EditDreamStoryPage({ params }: PageProps) {
  const { storyId } = await params;
  const [story, currentUser] = await Promise.all([
    getStoryById(storyId),
    getCurrentUser(),
  ]);

  if (!story) notFound();
  if (!currentUser?.id || currentUser.id !== story.userId) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Edit Your Dream
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Refine your dream story, update milestones, and keep your
            supporters informed.
          </p>
        </div>

        <EditDreamStoryForm storyId={storyId} story={story} />
      </div>
    </main>
  );
}
