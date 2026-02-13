"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

export async function toggleFollow(dreamStoryId: string) {
  const userId = await getCurrentUserId();

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_dreamStoryId: {
        followerId: userId,
        dreamStoryId,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({
      data: { followerId: userId, dreamStoryId },
    });
  }

  revalidatePath(`/stories/${dreamStoryId}`);
}
