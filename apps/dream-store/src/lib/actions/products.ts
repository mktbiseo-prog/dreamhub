"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProductSchema, updateProductSchema } from "@/lib/validations";
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

export async function updateProduct(
  productId: string,
  storyId: string,
  input: {
    title: string;
    description: string;
    price: string;
    whyIMadeThis?: string;
    category: string;
  }
) {
  const parsed = updateProductSchema.parse(input);
  const userId = await getCurrentUserId();

  // Check story ownership
  const story = await prisma.dreamStory.findUnique({
    where: { id: storyId },
  });

  if (!story || story.userId !== userId) {
    throw new Error("Dream story not found or access denied");
  }

  // Check product belongs to the story
  const existing = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existing || existing.dreamStoryId !== storyId) {
    throw new Error("Product not found or access denied");
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      title: parsed.title,
      description: parsed.description,
      price: Math.round(Number(parsed.price) * 100),
      whyIMadeThis: parsed.whyIMadeThis || null,
      category: parsed.category,
    },
  });

  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/products/${productId}`);
  redirect(`/stories/${storyId}/products/${productId}`);
}

export async function deleteProduct(productId: string, storyId: string) {
  const userId = await getCurrentUserId();

  // Check story ownership
  const story = await prisma.dreamStory.findUnique({
    where: { id: storyId },
  });

  if (!story || story.userId !== userId) {
    throw new Error("Dream story not found or access denied");
  }

  // Check product belongs to the story
  const existing = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existing || existing.dreamStoryId !== storyId) {
    throw new Error("Product not found or access denied");
  }

  // Cascade delete is handled by Prisma schema relations
  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath(`/stories/${storyId}`);
  redirect(`/stories/${storyId}`);
}
