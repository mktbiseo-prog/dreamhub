"use server";

import { prisma } from "@dreamhub/database";
import { analyzeThought } from "@dreamhub/ai";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { ThoughtCategory } from "@prisma/client";

// ── Validation ──────────────────────────────────────────────

const CreateThoughtSchema = z.object({
  title: z.string().max(200).optional(),
  body: z.string().min(1).max(10000),
});

const UpdateThoughtSchema = z.object({
  id: z.string().min(1),
  title: z.string().max(200).optional(),
  body: z.string().max(10000).optional(),
  category: z.enum(["WORK", "IDEAS", "EMOTIONS", "DAILY", "LEARNING", "RELATIONSHIPS", "HEALTH", "FINANCE", "DREAMS"]).optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  importance: z.number().min(1).max(5).optional(),
});

const ListThoughtsSchema = z.object({
  category: z.enum(["WORK", "IDEAS", "EMOTIONS", "DAILY", "LEARNING", "RELATIONSHIPS", "HEALTH", "FINANCE", "DREAMS"]).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

// ── Temp user ID (until auth is wired up) ───────────────────

const TEMP_USER_ID = "demo-user";

async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({ where: { id: TEMP_USER_ID } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: TEMP_USER_ID,
        email: "demo@dreambrain.app",
        name: "Demo User",
      },
    });
  }
}

// ── Actions ─────────────────────────────────────────────────

export async function createThought(input: { title?: string; body: string }) {
  const parsed = CreateThoughtSchema.parse(input);

  await ensureDemoUser();

  // AI analysis
  const analysis = await analyzeThought(parsed.body, parsed.title);

  const thought = await prisma.thought.create({
    data: {
      userId: TEMP_USER_ID,
      title: analysis.title,
      body: parsed.body,
      summary: analysis.summary,
      category: analysis.category as ThoughtCategory,
      tags: analysis.tags,
      keywords: analysis.keywords,
      importance: analysis.importance,
      inputMethod: "TEXT",
    },
  });

  // Find and create connections to related thoughts
  await findAndCreateConnections(thought.id, thought.tags, thought.keywords, thought.category);

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/brain");

  return thought;
}

export async function getThoughts(input?: {
  category?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}) {
  const parsed = ListThoughtsSchema.parse(input || {});

  await ensureDemoUser();

  const where: Record<string, unknown> = {
    userId: TEMP_USER_ID,
    isArchived: false,
  };

  if (parsed.category) {
    where.category = parsed.category;
  }

  if (parsed.search) {
    where.OR = [
      { title: { contains: parsed.search, mode: "insensitive" } },
      { body: { contains: parsed.search, mode: "insensitive" } },
      { summary: { contains: parsed.search, mode: "insensitive" } },
      { tags: { hasSome: [parsed.search.toLowerCase()] } },
    ];
  }

  const thoughts = await prisma.thought.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: parsed.limit,
    ...(parsed.cursor ? { skip: 1, cursor: { id: parsed.cursor } } : {}),
  });

  return thoughts;
}

export async function getThoughtById(id: string) {
  const thought = await prisma.thought.findUnique({
    where: { id },
  });

  return thought;
}

export async function getRelatedThoughts(thoughtId: string) {
  const connections = await prisma.thoughtConnection.findMany({
    where: { sourceThoughtId: thoughtId },
    include: { targetThought: true },
    orderBy: { score: "desc" },
    take: 5,
  });

  return connections.map((c) => ({
    thought: c.targetThought,
    score: c.score,
    reason: c.reason || "",
  }));
}

export async function updateThought(input: {
  id: string;
  title?: string;
  body?: string;
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  importance?: number;
}) {
  const parsed = UpdateThoughtSchema.parse(input);
  const { id, ...data } = parsed;

  const thought = await prisma.thought.update({
    where: { id },
    data: data as Record<string, unknown>,
  });

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath(`/thoughts/${id}`);

  return thought;
}

export async function deleteThought(id: string) {
  await prisma.thought.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/brain");
}

export async function toggleFavorite(id: string) {
  const thought = await prisma.thought.findUnique({ where: { id } });
  if (!thought) throw new Error("Thought not found");

  const updated = await prisma.thought.update({
    where: { id },
    data: { isFavorite: !thought.isFavorite },
  });

  revalidatePath(`/thoughts/${id}`);
  return updated;
}

export async function getGraphData() {
  await ensureDemoUser();

  const thoughts = await prisma.thought.findMany({
    where: { userId: TEMP_USER_ID, isArchived: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const thoughtIds = thoughts.map((t) => t.id);

  const connections = await prisma.thoughtConnection.findMany({
    where: {
      sourceThoughtId: { in: thoughtIds },
      targetThoughtId: { in: thoughtIds },
    },
  });

  return { thoughts, connections };
}

// ── Helpers ─────────────────────────────────────────────────

async function findAndCreateConnections(
  thoughtId: string,
  tags: string[],
  keywords: string[],
  category: ThoughtCategory
) {
  // Simple tag/keyword-based similarity (MVP — replace with vector similarity later)
  const existingThoughts = await prisma.thought.findMany({
    where: {
      userId: TEMP_USER_ID,
      id: { not: thoughtId },
      isArchived: false,
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  for (const existing of existingThoughts) {
    const sharedTags = tags.filter((t) => existing.tags.includes(t));
    const sharedKeywords = keywords.filter((k) => existing.keywords.includes(k));
    const sameCategory = existing.category === category;

    const tagScore = tags.length > 0 ? sharedTags.length / tags.length : 0;
    const keywordScore = keywords.length > 0 ? sharedKeywords.length / keywords.length : 0;
    const categoryBonus = sameCategory ? 0.15 : 0;

    const score = tagScore * 0.4 + keywordScore * 0.35 + categoryBonus + Math.random() * 0.1;

    if (score >= 0.3) {
      const reason = [
        sharedTags.length > 0 ? `Shared tags: ${sharedTags.join(", ")}` : "",
        sharedKeywords.length > 0 ? `Shared topics: ${sharedKeywords.join(", ")}` : "",
        sameCategory ? `Same category: ${category}` : "",
      ]
        .filter(Boolean)
        .join(". ");

      await prisma.thoughtConnection.upsert({
        where: {
          sourceThoughtId_targetThoughtId: {
            sourceThoughtId: thoughtId,
            targetThoughtId: existing.id,
          },
        },
        update: { score: Math.min(score, 1), reason },
        create: {
          sourceThoughtId: thoughtId,
          targetThoughtId: existing.id,
          score: Math.min(score, 1),
          reason,
        },
      });
    }
  }
}
