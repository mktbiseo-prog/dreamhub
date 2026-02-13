"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

export async function toggleBookmark(dreamStoryId: string) {
  const userId = await getCurrentUserId();

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_dreamStoryId: {
        userId,
        dreamStoryId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({
      data: { userId, dreamStoryId },
    });
  }

  revalidatePath(`/stories/${dreamStoryId}`);
  revalidatePath("/");
  revalidatePath("/my-dreams");
}
