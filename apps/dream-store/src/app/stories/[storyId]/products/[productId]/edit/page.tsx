export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { EditProductForm } from "./EditProductForm";

export const metadata: Metadata = {
  title: "Edit Product | Dream Store",
  description: "Update your product details.",
};

interface PageProps {
  params: Promise<{ storyId: string; productId: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { storyId, productId } = await params;
  const [result, currentUser] = await Promise.all([
    getProductById(productId),
    getCurrentUser(),
  ]);

  if (!result || result.story.id !== storyId) notFound();
  if (!currentUser?.id || currentUser.id !== result.story.userId) notFound();

  const { product, story } = result;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium text-amber-600">
            Editing product in
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {story.title}
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            Update your product details, pricing, and story connection.
          </p>
        </div>

        <EditProductForm
          storyId={storyId}
          productId={productId}
          product={product}
        />
      </div>
    </main>
  );
}
