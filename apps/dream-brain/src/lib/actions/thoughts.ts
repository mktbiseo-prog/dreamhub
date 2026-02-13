"use server";

import { prisma, type ThoughtCategory } from "@dreamhub/database";
import { analyzeThought, generateEmbedding, cosineSimilarity } from "@dreamhub/ai";
import type { ActionItem } from "@dreamhub/ai";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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

// ── Auth ────────────────────────────────────────────────────

import { getCurrentUserId } from "@/lib/auth";

async function ensureDemoUser() {
  const id = "demo-user";
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id,
        email: "demo@dreambrain.app",
        name: "Demo User",
      },
    });
  }
}

// ── Cache Invalidation ──────────────────────────────────────

async function invalidateInsightCache(userId: string) {
  try {
    await prisma.insightReport.deleteMany({ where: { userId } });
  } catch {
    // Best-effort — don't propagate cache errors
  }
}

// ── Actions ─────────────────────────────────────────────────

export async function createThought(input: { title?: string; body: string }) {
  const parsed = CreateThoughtSchema.parse(input);

  const userId = await getCurrentUserId();
  if (userId === "demo-user") await ensureDemoUser();

  // AI analysis + embedding
  const analysis = await analyzeThought(parsed.body, parsed.title);
  const embedding = await generateEmbedding(`${analysis.title}. ${parsed.body}`);

  const thought = await prisma.thought.create({
    data: {
      userId,
      title: analysis.title,
      body: parsed.body,
      summary: analysis.summary,
      category: analysis.category as ThoughtCategory,
      tags: analysis.tags,
      keywords: analysis.keywords,
      importance: analysis.importance,
      inputMethod: "TEXT",
      embedding,
      emotion: analysis.emotion,
      emotionSecondary: analysis.emotionSecondary || null,
      valence: analysis.valence,
      emotionConfidence: analysis.confidence,
      actionItems: JSON.parse(JSON.stringify(analysis.actionItems)),
      peopleMentioned: analysis.peopleMentioned,
      placesMentioned: analysis.placesMentioned,
    },
  });

  // Find and create connections to related thoughts
  await findAndCreateConnections(userId, thought.id, thought.tags, thought.keywords, thought.category, embedding);

  await invalidateInsightCache(userId);

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/brain");
  revalidatePath("/insights");

  return thought;
}

export async function getThoughts(input?: {
  category?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}) {
  const parsed = ListThoughtsSchema.parse(input || {});

  const userId = await getCurrentUserId();
  if (userId === "demo-user") await ensureDemoUser();

  const where: Record<string, unknown> = {
    userId,
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

  // Ownership check
  const userId = await getCurrentUserId();
  const existing = await prisma.thought.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Thought not found or access denied");
  }

  // Regenerate embedding if body changed
  const updateData = data as Record<string, unknown>;
  if (data.body) {
    const title = data.title || existing.title;
    updateData.embedding = await generateEmbedding(`${title}. ${data.body}`);
  }

  const thought = await prisma.thought.update({
    where: { id },
    data: updateData,
  });

  // Recalculate connections if body changed
  if (data.body) {
    await prisma.thoughtConnection.deleteMany({ where: { sourceThoughtId: id } });
    await findAndCreateConnections(userId, id, thought.tags, thought.keywords, thought.category, thought.embedding);
  }

  await invalidateInsightCache(userId);

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath(`/thoughts/${id}`);
  revalidatePath("/insights");

  return thought;
}

export async function deleteThought(id: string) {
  // Ownership check
  const userId = await getCurrentUserId();
  const existing = await prisma.thought.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Thought not found or access denied");
  }

  await prisma.thought.delete({ where: { id } });

  await invalidateInsightCache(userId);

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/brain");
  revalidatePath("/insights");
}

export async function createVoiceThought(input: {
  body: string;
  voiceDurationSeconds: number;
}) {
  const parsed = z
    .object({
      body: z.string().min(1).max(10000),
      voiceDurationSeconds: z.number().min(0).max(300),
    })
    .parse(input);

  const userId = await getCurrentUserId();
  if (userId === "demo-user") await ensureDemoUser();

  const analysis = await analyzeThought(parsed.body);
  const embedding = await generateEmbedding(`${analysis.title}. ${parsed.body}`);

  const thought = await prisma.thought.create({
    data: {
      userId,
      title: analysis.title,
      body: parsed.body,
      summary: analysis.summary,
      category: analysis.category as ThoughtCategory,
      tags: analysis.tags,
      keywords: analysis.keywords,
      importance: analysis.importance,
      inputMethod: "VOICE",
      voiceDurationSeconds: parsed.voiceDurationSeconds,
      embedding,
      emotion: analysis.emotion,
      emotionSecondary: analysis.emotionSecondary || null,
      valence: analysis.valence,
      emotionConfidence: analysis.confidence,
      actionItems: JSON.parse(JSON.stringify(analysis.actionItems)),
      peopleMentioned: analysis.peopleMentioned,
      placesMentioned: analysis.placesMentioned,
    },
  });

  await findAndCreateConnections(userId, thought.id, thought.tags, thought.keywords, thought.category, embedding);

  await invalidateInsightCache(userId);

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/brain");
  revalidatePath("/insights");

  return thought;
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

export async function togglePin(id: string) {
  const thought = await prisma.thought.findUnique({ where: { id } });
  if (!thought) throw new Error("Thought not found");

  const updated = await prisma.thought.update({
    where: { id },
    data: { isPinned: !thought.isPinned },
  });

  revalidatePath(`/thoughts/${id}`);
  revalidatePath("/");
  revalidatePath("/timeline");
  return updated;
}

export async function toggleArchive(id: string) {
  const thought = await prisma.thought.findUnique({ where: { id } });
  if (!thought) throw new Error("Thought not found");

  const updated = await prisma.thought.update({
    where: { id },
    data: { isArchived: !thought.isArchived },
  });

  revalidatePath(`/thoughts/${id}`);
  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/brain");
  return updated;
}

export async function toggleActionItem(thoughtId: string, itemIndex: number) {
  const userId = await getCurrentUserId();
  const thought = await prisma.thought.findUnique({ where: { id: thoughtId } });

  if (!thought || thought.userId !== userId) {
    throw new Error("Thought not found or access denied");
  }

  const items: ActionItem[] = Array.isArray(thought.actionItems)
    ? (thought.actionItems as unknown as ActionItem[])
    : [];

  if (itemIndex < 0 || itemIndex >= items.length) {
    throw new Error("Invalid action item index");
  }

  items[itemIndex].completed = !items[itemIndex].completed;

  await prisma.thought.update({
    where: { id: thoughtId },
    data: { actionItems: JSON.parse(JSON.stringify(items)) },
  });

  revalidatePath(`/thoughts/${thoughtId}`);
  revalidatePath("/insights");
}

export async function getGraphData() {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") await ensureDemoUser();

  const thoughts = await prisma.thought.findMany({
    where: { userId, isArchived: false },
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
  userId: string,
  thoughtId: string,
  tags: string[],
  keywords: string[],
  category: ThoughtCategory,
  embedding: number[] = []
) {
  const existingThoughts = await prisma.thought.findMany({
    where: {
      userId,
      id: { not: thoughtId },
      isArchived: false,
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  const hasEmbedding = embedding.length > 0;

  for (const existing of existingThoughts) {
    const sharedTags = tags.filter((t) => existing.tags.includes(t));
    const sharedKeywords = keywords.filter((k) => existing.keywords.includes(k));
    const sameCategory = existing.category === category;

    const tagScore = tags.length > 0 ? sharedTags.length / tags.length : 0;
    const keywordScore = keywords.length > 0 ? sharedKeywords.length / keywords.length : 0;
    const categoryBonus = sameCategory ? 0.15 : 0;

    let score: number;
    let threshold: number;

    if (hasEmbedding && existing.embedding.length > 0) {
      // Vector mode: 60% vector + 25% tag/keyword + 15% category
      const vectorScore = Math.max(0, cosineSimilarity(embedding, existing.embedding));
      const tagKeywordScore = tagScore * 0.6 + keywordScore * 0.4;
      score = vectorScore * 0.6 + tagKeywordScore * 0.25 + categoryBonus;
      threshold = 0.25;
    } else {
      // Fallback: 40% tag + 35% keyword + 15% category + 10% random
      score = tagScore * 0.4 + keywordScore * 0.35 + categoryBonus + Math.random() * 0.1;
      threshold = 0.3;
    }

    if (score >= threshold) {
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
