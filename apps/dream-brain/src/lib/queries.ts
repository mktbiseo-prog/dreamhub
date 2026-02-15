import { prisma } from "@dreamhub/database";
import { generateInsight, type InsightData } from "@dreamhub/ai";
import type { ActionItem } from "@dreamhub/ai";
import { fromDbCategory, type CategoryId } from "./categories";
import { mockThoughts, mockConnections, getRelatedThoughts as getMockRelated } from "./mock-data";
import { getCurrentUserId } from "./auth";
import type { ThoughtData, ConnectionData, RelatedThoughtData } from "./data";

let _dbAvailable: boolean | null = null;

export async function isDbAvailable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  if (_dbAvailable !== null) return _dbAvailable;
  try {
    await prisma.$queryRaw`SELECT 1`;
    _dbAvailable = true;
  } catch {
    _dbAvailable = false;
  }
  return _dbAvailable;
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
  isArchived: boolean;
  isPinned: boolean;
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
    isArchived: t.isArchived,
    isPinned: t.isPinned,
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
  includeArchived?: boolean;
  favoritesOnly?: boolean;
  pinnedOnly?: boolean;
}): Promise<ThoughtData[]> {
  if (!(await isDbAvailable())) {
    let results = [...mockThoughts];
    if (!options?.includeArchived) {
      results = results.filter((t) => !t.isArchived);
    }
    if (options?.favoritesOnly) {
      results = results.filter((t) => t.isFavorite);
    }
    if (options?.pinnedOnly) {
      results = results.filter((t) => t.isPinned);
    }
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
  };

  if (!options?.includeArchived) {
    where.isArchived = false;
  }

  if (options?.favoritesOnly) {
    where.isFavorite = true;
  }

  if (options?.pinnedOnly) {
    where.isPinned = true;
  }

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
  if (!(await isDbAvailable())) {
    const found = mockThoughts.find((t) => t.id === id);
    return found || null;
  }

  const thought = await prisma.thought.findUnique({ where: { id } });
  if (!thought) return null;
  return dbThoughtToData(thought);
}

export async function fetchRelatedThoughts(thoughtId: string): Promise<RelatedThoughtData[]> {
  if (!(await isDbAvailable())) {
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
  if (!(await isDbAvailable())) {
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
  if (!(await isDbAvailable())) {
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

export interface UserProfile {
  name: string | null;
  email: string;
  bio: string | null;
  dreamStatement: string | null;
  skills: string[];
  interests: string[];
}

export interface UserStats {
  totalThoughts: number;
  topCategory: string | null;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  if (!(await isDbAvailable())) {
    return {
      name: "Demo User",
      email: "demo@dreambrain.app",
      bio: "Exploring Dream Brain in demo mode.",
      dreamStatement: "Build something meaningful every day.",
      skills: ["TypeScript", "React", "AI"],
      interests: ["startups", "design", "coffee"],
    };
  }

  const userId = await getCurrentUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      bio: true,
      dreamStatement: true,
      skills: true,
      interests: true,
    },
  });

  if (!user) {
    return { name: null, email: "", bio: null, dreamStatement: null, skills: [], interests: [] };
  }
  return user;
}

export async function fetchUserStats(): Promise<UserStats> {
  if (!(await isDbAvailable())) {
    const categoryCounts: Record<string, number> = {};
    for (const t of mockThoughts) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    return { totalThoughts: mockThoughts.length, topCategory };
  }

  const userId = await getCurrentUserId();
  const totalThoughts = await prisma.thought.count({
    where: { userId, isArchived: false },
  });

  const topCategoryResult = await prisma.thought.groupBy({
    by: ["category"],
    where: { userId, isArchived: false },
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
    take: 1,
  });

  const topCategory = topCategoryResult[0]?.category?.toLowerCase() || null;

  return { totalThoughts, topCategory };
}

export interface UserPreferencesData {
  aiProcessingLevel: string;
  dailyPromptEnabled: boolean;
  weeklyInsightEnabled: boolean;
  connectionAlerts: boolean;
  defaultView: string;
  thoughtsPerPage: number;
  embeddingEnabled: boolean;
}

const DEFAULT_PREFERENCES: UserPreferencesData = {
  aiProcessingLevel: "standard",
  dailyPromptEnabled: true,
  weeklyInsightEnabled: true,
  connectionAlerts: true,
  defaultView: "home",
  thoughtsPerPage: 20,
  embeddingEnabled: true,
};

export async function fetchUserPreferences(): Promise<UserPreferencesData> {
  if (!(await isDbAvailable())) return DEFAULT_PREFERENCES;

  const userId = await getCurrentUserId();
  const prefs = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  if (!prefs) return DEFAULT_PREFERENCES;

  return {
    aiProcessingLevel: prefs.aiProcessingLevel,
    dailyPromptEnabled: prefs.dailyPromptEnabled,
    weeklyInsightEnabled: prefs.weeklyInsightEnabled,
    connectionAlerts: prefs.connectionAlerts,
    defaultView: prefs.defaultView,
    thoughtsPerPage: prefs.thoughtsPerPage,
    embeddingEnabled: prefs.embeddingEnabled,
  };
}

export async function fetchOnboardingStatus(): Promise<boolean> {
  if (!(await isDbAvailable())) return true;

  const userId = await getCurrentUserId();
  if (userId === "demo-user") return true;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  });

  return user?.onboardingCompleted ?? false;
}
