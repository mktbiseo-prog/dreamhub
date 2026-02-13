"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProductSchema } from "@/lib/validations";
import { getCurrentUserId } from "@/lib/auth";

export async function createProduct(
  storyId: string,
  input: {
    title: string;
    description: string;
    price: string;
    whyIMadeThis?: string;
    category: string;
  }
) {
  const parsed = createProductSchema.parse(input);
  const userId = await getCurrentUserId();

  // Check story ownership
  const story = await prisma.dreamStory.findUnique({
    where: { id: storyId },
  });

  if (!story || story.userId !== userId) {
    throw new Error("Dream story not found or access denied");
  }

  const product = await prisma.product.create({
    data: {
      dreamStoryId: storyId,
      title: parsed.title,
      description: parsed.description,
      price: Math.round(Number(parsed.price) * 100),
      whyIMadeThis: parsed.whyIMadeThis || null,
      category: parsed.category,
    },
  });

  revalidatePath(`/stories/${storyId}`);
  redirect(`/stories/${storyId}/products/${product.id}`);
}
