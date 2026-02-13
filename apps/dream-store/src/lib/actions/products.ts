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
    images?: string[];
    productType?: string;
    shippingWeight?: number;
    shippingCost?: string;
    isDigital?: boolean;
  }
) {
  const parsed = createProductSchema.parse(input);
  const userId = await getCurrentUserId();

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
      images: parsed.images || [],
      productType: parsed.productType || "Physical Product",
      shippingWeight: parsed.shippingWeight || null,
      shippingCost: parsed.shippingCost ? Math.round(Number(parsed.shippingCost) * 100) : 0,
      isDigital: parsed.isDigital || false,
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
    images?: string[];
    productType?: string;
    shippingWeight?: number;
    shippingCost?: string;
    isDigital?: boolean;
  }
) {
  const parsed = updateProductSchema.parse(input);
  const userId = await getCurrentUserId();

  const story = await prisma.dreamStory.findUnique({
    where: { id: storyId },
  });

  if (!story || story.userId !== userId) {
    throw new Error("Dream story not found or access denied");
  }

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
      images: parsed.images || [],
      productType: parsed.productType || "Physical Product",
      shippingWeight: parsed.shippingWeight || null,
      shippingCost: parsed.shippingCost ? Math.round(Number(parsed.shippingCost) * 100) : 0,
      isDigital: parsed.isDigital || false,
    },
  });

  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/products/${productId}`);
  redirect(`/stories/${storyId}/products/${productId}`);
}

export async function deleteProduct(productId: string, storyId: string) {
  const userId = await getCurrentUserId();

  const story = await prisma.dreamStory.findUnique({
    where: { id: storyId },
  });

  if (!story || story.userId !== userId) {
    throw new Error("Dream story not found or access denied");
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existing || existing.dreamStoryId !== storyId) {
    throw new Error("Product not found or access denied");
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath(`/stories/${storyId}`);
  redirect(`/stories/${storyId}`);
}
