"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validations";

export async function createReview(
  productId: string,
  input: { rating: number; content: string }
) {
  const userId = await getCurrentUserId();

  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  // Look up the product to find the storyId for revalidation
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { dreamStoryId: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  await prisma.review.create({
    data: {
      productId,
      buyerId: userId,
      rating: parsed.data.rating,
      content: parsed.data.content.trim(),
    },
  });

  revalidatePath(
    `/stories/${product.dreamStoryId}/products/${productId}`
  );
}

export async function deleteReview(reviewId: string) {
  const userId = await getCurrentUserId();

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { buyerId: true, productId: true, product: { select: { dreamStoryId: true } } },
  });

  if (!review || review.buyerId !== userId) {
    throw new Error("Only the author can delete this review");
  }

  await prisma.review.delete({ where: { id: reviewId } });

  revalidatePath(
    `/stories/${review.product.dreamStoryId}/products/${review.productId}`
  );
}
