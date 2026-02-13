import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoryById } from "@/lib/queries";
import { CreateProductForm } from "./CreateProductForm";

export const metadata: Metadata = {
  title: "Add a Product | Dream Store",
  description: "List a product under your dream story.",
};

interface PageProps {
  params: Promise<{ storyId: string }>;
}

export default async function CreateProductPage({ params }: PageProps) {
  const { storyId } = await params;
  const story = await getStoryById(storyId);
  if (!story) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium text-brand-600">
            Adding product to
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {story.title}
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            Every product you list is connected to your dream. Tell buyers why
            you made it and how their purchase supports your journey.
          </p>
        </div>

        <CreateProductForm storyId={storyId} />
      </div>
    </main>
  );
}
