"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

export async function createDreamUpdate(
  dreamStoryId: string,
  input: { title: string; content: string }
) {
  const userId = await getCurrentUserId();

  // Verify ownership
  const story = await prisma.dreamStory.findUnique({
    where: { id: dreamStoryId },
    select: { userId: true },
  });

  if (!story || story.userId !== userId) {
    throw new Error("Only the dream creator can post updates");
  }

  await prisma.dreamUpdate.create({
    data: {
      dreamStoryId,
      userId,
      title: input.title.trim(),
      content: input.content.trim(),
    },
  });

  revalidatePath(`/stories/${dreamStoryId}`);
}

export async function deleteDreamUpdate(updateId: string) {
  const userId = await getCurrentUserId();

  const update = await prisma.dreamUpdate.findUnique({
    where: { id: updateId },
    select: { userId: true, dreamStoryId: true },
  });

  if (!update || update.userId !== userId) {
    throw new Error("Only the author can delete this update");
  }

  await prisma.dreamUpdate.delete({ where: { id: updateId } });

  revalidatePath(`/stories/${update.dreamStoryId}`);
}
