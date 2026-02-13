"use server";

import { prisma } from "@dreamhub/database";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

const UpdatePreferencesSchema = z.object({
  aiProcessingLevel: z.enum(["minimal", "standard", "detailed"]).optional(),
  dailyPromptEnabled: z.boolean().optional(),
  weeklyInsightEnabled: z.boolean().optional(),
  connectionAlerts: z.boolean().optional(),
  defaultView: z.enum(["home", "timeline", "brain"]).optional(),
  thoughtsPerPage: z.number().min(10).max(100).optional(),
  embeddingEnabled: z.boolean().optional(),
});

export async function updateUserPreferences(input: {
  aiProcessingLevel?: string;
  dailyPromptEnabled?: boolean;
  weeklyInsightEnabled?: boolean;
  connectionAlerts?: boolean;
  defaultView?: string;
  thoughtsPerPage?: number;
  embeddingEnabled?: boolean;
}) {
  const parsed = UpdatePreferencesSchema.parse(input);
  const userId = await getCurrentUserId();

  const prefs = await prisma.userPreferences.upsert({
    where: { userId },
    update: parsed,
    create: {
      userId,
      ...parsed,
    },
  });

  revalidatePath("/settings");
  return prefs;
}

export async function exportUserData(): Promise<string> {
  const userId = await getCurrentUserId();

  const [user, thoughts, connections, insights] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        bio: true,
        dreamStatement: true,
        skills: true,
        interests: true,
        createdAt: true,
      },
    }),
    prisma.thought.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.thoughtConnection.findMany({
      where: {
        sourceThought: { userId },
      },
    }),
    prisma.insightReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return JSON.stringify(
    { user, thoughts, connections, insights, exportedAt: new Date().toISOString() },
    null,
    2
  );
}

export async function deleteAllUserData() {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") {
    throw new Error("Cannot delete demo user data");
  }

  await prisma.insightReport.deleteMany({ where: { userId } });
  await prisma.thoughtConnection.deleteMany({
    where: { sourceThought: { userId } },
  });
  await prisma.thought.deleteMany({ where: { userId } });
  await prisma.userPreferences.deleteMany({ where: { userId } });

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/brain");
  revalidatePath("/insights");
  revalidatePath("/settings");
}
