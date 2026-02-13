import { prisma } from "@dreamhub/database";
import { fromDbCategory, type CategoryId } from "./categories";
import { mockThoughts, mockConnections, getRelatedThoughts as getMockRelated } from "./mock-data";
import { getCurrentUserId } from "./auth";
import type { ThoughtData, ConnectionData, RelatedThoughtData } from "./data";

function isDbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
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
