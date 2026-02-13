import type { CategoryId } from "./categories";
import type { EmotionType, ActionItem } from "@dreamhub/ai";

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
  inputMethod?: "TEXT" | "VOICE";
  voiceDurationSeconds?: number;
  emotion?: EmotionType;
  emotionSecondary?: EmotionType;
  valence?: number;
  emotionConfidence?: number;
  actionItems: ActionItem[];
  peopleMentioned: string[];
  placesMentioned: string[];
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
