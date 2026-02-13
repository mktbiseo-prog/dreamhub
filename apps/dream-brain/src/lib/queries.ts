import { prisma } from "@dreamhub/database";
import { generateInsight, type InsightData } from "@dreamhub/ai";
import type { ActionItem } from "@dreamhub/ai";
import { fromDbCategory, type CategoryId } from "./categories";
import { mockThoughts, mockConnections, getRelatedThoughts as getMockRelated } from "./mock-data";
import { getCurrentUserId } from "./auth";
import type { ThoughtData, ConnectionData, RelatedThoughtData } from "./data";

function isDbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

function parseActionItems(raw: unknown): ActionItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as ActionItem[];
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as ActionItem[]; } catch { return []; }
  }
  return [];
}

function dbThoughtToData(t: {
  id: string;
  title: string;
  body: string;
  summary: string | null;
  category: string;
  tags: string[];
  keywords: string[];
  createdAt: Date;
  isFavorite: boolean;
  importance: number;
  inputMethod?: string;
  voiceDurationSeconds?: number | null;
  emotion?: string | null;
  emotionSecondary?: string | null;
  valence?: number | null;
  emotionConfidence?: number | null;
  actionItems?: unknown;
  peopleMentioned?: string[];
  placesMentioned?: string[];
}): ThoughtData {
  return {
    id: t.id,
    title: t.title,
    body: t.body,
    summary: t.summary || "",
    category: fromDbCategory(t.category),
    tags: t.tags,
    keywords: t.keywords,
    createdAt: t.createdAt.toISOString(),
    isFavorite: t.isFavorite,
    importance: t.importance,
    inputMethod: (t.inputMethod as "TEXT" | "VOICE") || "TEXT",
    voiceDurationSeconds: t.voiceDurationSeconds ?? undefined,
    emotion: (t.emotion as ThoughtData["emotion"]) ?? undefined,
    emotionSecondary: (t.emotionSecondary as ThoughtData["emotionSecondary"]) ?? undefined,
    valence: t.valence ?? undefined,
    emotionConfidence: t.emotionConfidence ?? undefined,
    actionItems: parseActionItems(t.actionItems),
    peopleMentioned: t.peopleMentioned ?? [],
    placesMentioned: t.placesMentioned ?? [],
  };
}

export async function fetchThoughts(options?: {
  category?: CategoryId;
  search?: string;
  limit?: number;
}): Promise<ThoughtData[]> {
  if (!isDbAvailable()) {
    let results = [...mockThoughts];
    if (options?.category) {
      results = results.filter((t) => t.category === options.category);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      results = results.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.body.toLowerCase().includes(q)
      );
    }
    return results.slice(0, options?.limit || 50);
  }

  const userId = await getCurrentUserId();
  const where: Record<string, unknown> = {
    userId,
    isArchived: false,
  };

  if (options?.category) {
    where.category = options.category.toUpperCase();
  }

  if (options?.search) {
    where.OR = [
      { title: { contains: options.search, mode: "insensitive" } },
      { body: { contains: options.search, mode: "insensitive" } },
      { summary: { contains: options.search, mode: "insensitive" } },
      { tags: { hasSome: [options.search.toLowerCase()] } },
    ];
  }

  const thoughts = await prisma.thought.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit || 50,
  });

  return thoughts.map(dbThoughtToData);
}

export async function fetchThoughtById(id: string): Promise<ThoughtData | null> {
  if (!isDbAvailable()) {
    const found = mockThoughts.find((t) => t.id === id);
    return found || null;
  }

  const thought = await prisma.thought.findUnique({ where: { id } });
  if (!thought) return null;
  return dbThoughtToData(thought);
}

export async function fetchRelatedThoughts(thoughtId: string): Promise<RelatedThoughtData[]> {
  if (!isDbAvailable()) {
    return getMockRelated(thoughtId);
  }

  const connections = await prisma.thoughtConnection.findMany({
    where: { sourceThoughtId: thoughtId },
    include: { targetThought: true },
    orderBy: { score: "desc" },
    take: 5,
  });

  return connections.map((c) => ({
    thought: dbThoughtToData(c.targetThought),
    score: c.score,
    reason: c.reason || "",
  }));
}

export async function fetchGraphData(): Promise<{
  thoughts: ThoughtData[];
  connections: ConnectionData[];
}> {
  if (!isDbAvailable()) {
    return {
      thoughts: mockThoughts,
      connections: mockConnections.map((c) => ({
        sourceId: c.sourceId,
        targetId: c.targetId,
        score: c.score,
        reason: c.reason,
      })),
    };
  }

  const userId = await getCurrentUserId();
  const thoughts = await prisma.thought.findMany({
    where: { userId, isArchived: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const thoughtIds = thoughts.map((t) => t.id);

  const dbConnections = await prisma.thoughtConnection.findMany({
    where: {
      sourceThoughtId: { in: thoughtIds },
      targetThoughtId: { in: thoughtIds },
    },
  });

  return {
    thoughts: thoughts.map(dbThoughtToData),
    connections: dbConnections.map((c) => ({
      sourceId: c.sourceThoughtId,
      targetId: c.targetThoughtId,
      score: c.score,
      reason: c.reason || "",
    })),
  };
}

export async function fetchInsight(periodType: "weekly" | "monthly"): Promise<InsightData> {
  if (!isDbAvailable()) {
    // Use mock thoughts to generate insight
    return generateInsight(mockThoughts.map((t) => ({
      category: t.category.toUpperCase(),
      emotion: t.emotion,
      keywords: t.keywords,
      tags: t.tags,
      importance: t.importance,
      actionItems: t.actionItems,
      createdAt: t.createdAt,
      summary: t.summary,
    })), periodType);
  }

  const userId = await getCurrentUserId();

  // Calculate period boundaries
  const now = new Date();
  const periodStart = new Date(now);
  if (periodType === "weekly") {
    periodStart.setDate(now.getDate() - 7);
  } else {
    periodStart.setMonth(now.getMonth() - 1);
  }
  periodStart.setHours(0, 0, 0, 0);

  // Check cache
  const cached = await prisma.insightReport.findUnique({
    where: {
      userId_periodType_periodStart: {
        userId,
        periodType,
        periodStart,
      },
    },
  });

  if (cached) {
    // TTL check: weekly = 24h, monthly = 72h
    const ttlMs = periodType === "weekly" ? 24 * 60 * 60 * 1000 : 72 * 60 * 60 * 1000;
    const age = now.getTime() - cached.createdAt.getTime();
    if (age < ttlMs) {
      return cached.content as unknown as InsightData;
    }
    // Stale — delete and regenerate
    await prisma.insightReport.delete({ where: { id: cached.id } });
  }

  // Fetch thoughts for the period
  const thoughts = await prisma.thought.findMany({
    where: {
      userId,
      isArchived: false,
      createdAt: { gte: periodStart },
    },
    orderBy: { createdAt: "desc" },
  });

  const thoughtInputs = thoughts.map((t) => ({
    category: t.category,
    emotion: t.emotion || "calm",
    keywords: t.keywords,
    tags: t.tags,
    importance: t.importance,
    actionItems: parseActionItems(t.actionItems),
    createdAt: t.createdAt.toISOString(),
    summary: t.summary || "",
  }));

  const insight = await generateInsight(thoughtInputs, periodType);

  // Cache the result
  await prisma.insightReport.create({
    data: {
      userId,
      periodType,
      periodStart,
      periodEnd: now,
      content: JSON.parse(JSON.stringify(insight)),
    },
  });

  return insight;
}

export async function fetchTodayInsight(): Promise<string | null> {
  try {
    const insight = await fetchInsight("weekly");
    return insight.todayInsight || null;
  } catch {
    return null;
  }
}
