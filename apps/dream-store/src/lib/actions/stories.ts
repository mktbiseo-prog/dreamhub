"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createDreamStorySchema } from "@/lib/validations";
import { getCurrentUserId } from "@/lib/auth";

export async function createDreamStory(input: {
  title: string;
  statement: string;
  originStory?: string;
  impactStatement?: string;
  creatorStage?: string;
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
