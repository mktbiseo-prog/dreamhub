"use server";

import { prisma, type Thought } from "@dreamhub/database";
import { generateEmbedding, cosineSimilarity } from "@dreamhub/ai";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { fromDbCategory } from "@/lib/categories";
import { mockThoughts } from "@/lib/mock-data";
import type { ThoughtData } from "@/lib/data";
import type { ActionItem } from "@dreamhub/ai";

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

const SearchSchema = z.object({
  query: z.string().min(1).max(500),
  mode: z.enum(["text", "semantic"]).default("text"),
  category: z.string().optional(),
  emotion: z.string().optional(),
  sortBy: z.enum(["relevance", "newest", "oldest", "importance"]).default("relevance"),
  importanceMin: z.number().min(1).max(5).optional(),
  importanceMax: z.number().min(1).max(5).optional(),
  limit: z.number().min(1).max(50).default(20),
});

export interface SearchResult {
  thought: ThoughtData;
  relevance: number;
}

export async function searchThoughts(input: {
  query: string;
  mode?: "text" | "semantic";
  category?: string;
  emotion?: string;
  sortBy?: "relevance" | "newest" | "oldest" | "importance";
  importanceMin?: number;
  importanceMax?: number;
  limit?: number;
}): Promise<SearchResult[]> {
  const parsed = SearchSchema.parse(input);

  if (!isDbAvailable()) {
    return searchMockThoughts(parsed);
  }

  if (parsed.mode === "semantic") {
    return semanticSearch(parsed);
  }
  return textSearch(parsed);
}

function searchMockThoughts(parsed: z.infer<typeof SearchSchema>): SearchResult[] {
  const q = parsed.query.toLowerCase();
  let results: SearchResult[] = mockThoughts
    .filter((t) => {
      if (parsed.category && t.category !== parsed.category) return false;
      if (parsed.emotion && t.emotion !== parsed.emotion) return false;
      if (parsed.importanceMin && t.importance < parsed.importanceMin) return false;
      if (parsed.importanceMax && t.importance > parsed.importanceMax) return false;
      return (
        t.title.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.tags.some((tag: string) => tag.toLowerCase().includes(q)) ||
        t.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    })
    .map((t): SearchResult => {
      const titleMatch = t.title.toLowerCase().includes(q) ? 0.4 : 0;
      const bodyMatch = t.body.toLowerCase().includes(q) ? 0.2 : 0;
      const tagMatch = t.tags.some((tag: string) => tag.toLowerCase().includes(q)) ? 0.3 : 0;
      const relevance = Math.min(titleMatch + bodyMatch + tagMatch + 0.1, 1);
      return {
        thought: {
          id: t.id,
          title: t.title,
          body: t.body,
          summary: t.summary,
          category: t.category,
          tags: t.tags,
          keywords: t.keywords,
          createdAt: t.createdAt,
          isFavorite: t.isFavorite,
          isArchived: t.isArchived,
          isPinned: t.isPinned,
          importance: t.importance,
          emotion: t.emotion,
          emotionSecondary: t.emotionSecondary,
          valence: t.valence,
          emotionConfidence: t.emotionConfidence,
          actionItems: t.actionItems,
          peopleMentioned: t.peopleMentioned,
          placesMentioned: t.placesMentioned,
        },
        relevance,
      };
    });

  results = sortResults(results, parsed.sortBy);
  return results.slice(0, parsed.limit);
}

async function textSearch(parsed: z.infer<typeof SearchSchema>): Promise<SearchResult[]> {
  const userId = await getCurrentUserId();

  const where: Record<string, unknown> = {
    userId,
    isArchived: false,
    OR: [
      { title: { contains: parsed.query, mode: "insensitive" } },
      { body: { contains: parsed.query, mode: "insensitive" } },
      { summary: { contains: parsed.query, mode: "insensitive" } },
      { tags: { hasSome: [parsed.query.toLowerCase()] } },
    ],
  };

  if (parsed.category) where.category = parsed.category.toUpperCase();
  if (parsed.emotion) where.emotion = parsed.emotion;
  if (parsed.importanceMin || parsed.importanceMax) {
    where.importance = {
      ...(parsed.importanceMin ? { gte: parsed.importanceMin } : {}),
      ...(parsed.importanceMax ? { lte: parsed.importanceMax } : {}),
    };
  }

  const thoughts = await prisma.thought.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: parsed.limit,
  });

  const q = parsed.query.toLowerCase();
  let results: SearchResult[] = thoughts.map((t: Thought) => {
    const titleMatch = t.title.toLowerCase().includes(q) ? 0.4 : 0;
    const bodyMatch = t.body.toLowerCase().includes(q) ? 0.2 : 0;
    const tagMatch = t.tags.some((tag: string) => tag.toLowerCase().includes(q)) ? 0.3 : 0;
    const relevance = Math.min(titleMatch + bodyMatch + tagMatch + 0.1, 1);
    return {
      thought: {
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
        emotion: (t.emotion as ThoughtData["emotion"]) ?? undefined,
        emotionSecondary: (t.emotionSecondary as ThoughtData["emotionSecondary"]) ?? undefined,
        valence: t.valence ?? undefined,
        emotionConfidence: t.emotionConfidence ?? undefined,
        actionItems: parseActionItems(t.actionItems),
        peopleMentioned: t.peopleMentioned,
        placesMentioned: t.placesMentioned,
      },
      relevance,
    };
  });

  results = sortResults(results, parsed.sortBy);
  return results;
}

async function semanticSearch(parsed: z.infer<typeof SearchSchema>): Promise<SearchResult[]> {
  const userId = await getCurrentUserId();

  const queryEmbedding = await generateEmbedding(parsed.query);
  if (!queryEmbedding || queryEmbedding.length === 0) {
    return textSearch(parsed);
  }

  const where: Record<string, unknown> = {
    userId,
    isArchived: false,
  };

  if (parsed.category) where.category = parsed.category.toUpperCase();
  if (parsed.emotion) where.emotion = parsed.emotion;
  if (parsed.importanceMin || parsed.importanceMax) {
    where.importance = {
      ...(parsed.importanceMin ? { gte: parsed.importanceMin } : {}),
      ...(parsed.importanceMax ? { lte: parsed.importanceMax } : {}),
    };
  }

  const thoughts = await prisma.thought.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  let results: SearchResult[] = thoughts
    .filter((t) => t.embedding.length > 0)
    .map((t) => {
      const similarity = Math.max(0, cosineSimilarity(queryEmbedding, t.embedding));
      return {
        thought: {
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
          emotion: (t.emotion as ThoughtData["emotion"]) ?? undefined,
          emotionSecondary: (t.emotionSecondary as ThoughtData["emotionSecondary"]) ?? undefined,
          valence: t.valence ?? undefined,
          emotionConfidence: t.emotionConfidence ?? undefined,
          actionItems: parseActionItems(t.actionItems),
          peopleMentioned: t.peopleMentioned,
          placesMentioned: t.placesMentioned,
        },
        relevance: similarity,
      };
    })
    .filter((r) => r.relevance > 0.1);

  results = sortResults(results, parsed.sortBy);
  return results.slice(0, parsed.limit);
}

function sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
  switch (sortBy) {
    case "relevance":
      return results.sort((a, b) => b.relevance - a.relevance);
    case "newest":
      return results.sort(
        (a, b) => new Date(b.thought.createdAt).getTime() - new Date(a.thought.createdAt).getTime()
      );
    case "oldest":
      return results.sort(
        (a, b) => new Date(a.thought.createdAt).getTime() - new Date(b.thought.createdAt).getTime()
      );
    case "importance":
      return results.sort((a, b) => b.thought.importance - a.thought.importance);
    default:
      return results;
  }
}
