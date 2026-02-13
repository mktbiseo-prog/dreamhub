"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

export async function createDreamComment(
  dreamStoryId: string,
  content: string
) {
  const userId = await getCurrentUserId();

  await prisma.dreamComment.create({
    data: {
      dreamStoryId,
      userId,
      content: content.trim(),
    },
  });

  revalidatePath(`/stories/${dreamStoryId}`);
}

export async function deleteDreamComment(commentId: string) {
  const userId = await getCurrentUserId();

  const comment = await prisma.dreamComment.findUnique({
    where: { id: commentId },
    select: { userId: true, dreamStoryId: true },
  });

  if (!comment || comment.userId !== userId) {
    throw new Error("Only the author can delete this comment");
  }

  await prisma.dreamComment.delete({ where: { id: commentId } });

  revalidatePath(`/stories/${comment.dreamStoryId}`);
}
