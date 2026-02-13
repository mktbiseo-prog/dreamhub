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

export async function exportUserDataMarkdown(): Promise<string> {
  const userId = await getCurrentUserId();

  const [user, thoughts] = await Promise.all([
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
  ]);

  const lines: string[] = [];
  lines.push("# Dream Brain Export");
  lines.push("");
  lines.push(`**Exported:** ${new Date().toISOString().split("T")[0]}`);
  lines.push("");

  if (user) {
    lines.push("## Profile");
    lines.push("");
    if (user.name) lines.push(`- **Name:** ${user.name}`);
    if (user.email) lines.push(`- **Email:** ${user.email}`);
    if (user.bio) lines.push(`- **Bio:** ${user.bio}`);
    if (user.dreamStatement) lines.push(`- **Dream Statement:** ${user.dreamStatement}`);
    if (user.skills.length > 0) lines.push(`- **Skills:** ${user.skills.join(", ")}`);
    if (user.interests.length > 0) lines.push(`- **Interests:** ${user.interests.join(", ")}`);
    lines.push(`- **Joined:** ${new Date(user.createdAt).toLocaleDateString("en-US")}`);
    lines.push("");
  }

  lines.push(`## Thoughts (${thoughts.length})`);
  lines.push("");

  for (const thought of thoughts) {
    const date = new Date(thought.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    lines.push(`### ${thought.title}`);
    lines.push("");
    lines.push(`**Date:** ${date} | **Category:** ${thought.category} | **Importance:** ${thought.importance}/10`);
    if (thought.summary) lines.push(`**Summary:** ${thought.summary}`);
    lines.push("");
    lines.push(thought.body);
    lines.push("");
    if (thought.tags.length > 0) lines.push(`**Tags:** ${thought.tags.map((t) => `#${t}`).join(" ")}`);
    if (thought.emotion) lines.push(`**Emotion:** ${thought.emotion}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
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
