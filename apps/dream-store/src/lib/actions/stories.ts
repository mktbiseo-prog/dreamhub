"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createDreamStorySchema, updateDreamStorySchema } from "@/lib/validations";
import { getCurrentUserId } from "@/lib/auth";

export async function createDreamStory(input: {
  title: string;
  statement: string;
  originStory?: string;
  impactStatement?: string;
  creatorStage?: string;
  videoUrl?: string;
  coverImage?: string;
  processImages?: string[];
  status?: "ACTIVE" | "PREVIEW";
  milestones: { title: string; targetDate: string }[];
}) {
  const parsed = createDreamStorySchema.parse(input);
  const userId = await getCurrentUserId();

  const story = await prisma.dreamStory.create({
    data: {
      userId,
      title: parsed.title,
      statement: parsed.statement,
      originStory: parsed.originStory || null,
      impactStatement: parsed.impactStatement || null,
      creatorStage: parsed.creatorStage || "early",
      videoUrl: parsed.videoUrl || null,
      coverImage: parsed.coverImage || null,
      processImages: parsed.processImages || [],
      status: parsed.status || "ACTIVE",
      milestones: {
        createMany: {
          data: parsed.milestones.map((m, idx) => ({
            title: m.title,
            targetDate: new Date(m.targetDate),
            sortOrder: idx,
          })),
        },
      },
    },
  });

  revalidatePath("/");
  redirect(`/stories/${story.id}`);
}

export async function launchDreamStory(storyId: string) {
  const userId = await getCurrentUserId();

  const story = await prisma.dreamStory.findUnique({
    where: { id: storyId },
    select: { userId: true, status: true },
  });

  if (!story || story.userId !== userId) {
    throw new Error("Dream story not found or access denied");
  }

  if (story.status !== "PREVIEW") {
    throw new Error("Only preview dreams can be launched");
  }

  await prisma.dreamStory.update({
    where: { id: storyId },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/");
  revalidatePath(`/stories/${storyId}`);
}

export async function updateDreamStory(
  storyId: string,
  input: {
    title: string;
    statement: string;
    originStory?: string;
    impactStatement?: string;
    creatorStage?: string;
    videoUrl?: string;
    coverImage?: string;
    processImages?: string[];
    milestones: { title: string; targetDate: string }[];
  }
) {
  const parsed = updateDreamStorySchema.parse(input);
  const userId = await getCurrentUserId();

  const existing = await prisma.dreamStory.findUnique({
    where: { id: storyId },
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Dream story not found or access denied");
  }

  await prisma.$transaction(async (tx) => {
    await tx.dreamStory.update({
      where: { id: storyId },
      data: {
        title: parsed.title,
        statement: parsed.statement,
        originStory: parsed.originStory || null,
        impactStatement: parsed.impactStatement || null,
        creatorStage: parsed.creatorStage || "early",
        videoUrl: parsed.videoUrl || null,
        coverImage: parsed.coverImage || null,
        processImages: parsed.processImages || [],
      },
    });

    await tx.milestone.deleteMany({
      where: { dreamStoryId: storyId },
    });

    await tx.milestone.createMany({
      data: parsed.milestones.map((m, idx) => ({
        dreamStoryId: storyId,
        title: m.title,
        targetDate: new Date(m.targetDate),
        sortOrder: idx,
      })),
    });
  });

  revalidatePath("/");
  revalidatePath(`/stories/${storyId}`);
  redirect(`/stories/${storyId}`);
}

export async function deleteDreamStory(storyId: string) {
  const userId = await getCurrentUserId();

  const existing = await prisma.dreamStory.findUnique({
    where: { id: storyId },
  });

  if (!existing || existing.userId !== userId) {
    throw new Error("Dream story not found or access denied");
  }

  await prisma.dreamStory.delete({
    where: { id: storyId },
  });

  revalidatePath("/");
  redirect("/");
}
