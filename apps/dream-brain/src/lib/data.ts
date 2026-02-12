import type { CategoryId } from "./categories";

/**
 * Shared Thought type used across all frontend components.
 * Works with both DB records and mock data.
 */
export interface ThoughtData {
  id: string;
  title: string;
  body: string;
  summary: string;
  category: CategoryId;
  tags: string[];
  keywords: string[];
  createdAt: string;
  isFavorite: boolean;
  importance: number;
}

export interface ConnectionData {
  sourceId: string;
  targetId: string;
  score: number;
  reason: string;
}

export interface RelatedThoughtData {
  thought: ThoughtData;
  score: number;
  reason: string;
}
