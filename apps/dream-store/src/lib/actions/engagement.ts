"use server";

import { prisma } from "@dreamhub/database";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function trackEngagement(
  dreamStoryId: string,
  type: "view" | "read_complete" | "video_watch" | "share"
) {
  try {
    const userId = await getCurrentUserId();
    if (userId === "demo-user") return; // Don't track anonymous

    await prisma.storyEngagement.create({
      data: { userId, dreamStoryId, type },
    });
  } catch {
    // Non-critical — don't fail
  }
}

export async function voteMostInspiring(dreamStoryId: string) {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") {
    throw new Error("Please sign in to vote");
  }

  // Toggle vote
  const existing = await prisma.communityVote.findUnique({
    where: {
      userId_dreamStoryId: { userId, dreamStoryId },
    },
  });

  if (existing) {
    await prisma.communityVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.communityVote.create({
      data: { userId, dreamStoryId },
    });
  }

  revalidatePath("/");
}
