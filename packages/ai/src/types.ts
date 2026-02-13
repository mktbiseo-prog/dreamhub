export type EmotionType =
  | "excited"
  | "grateful"
  | "anxious"
  | "frustrated"
  | "curious"
  | "calm"
  | "determined"
  | "confused"
  | "hopeful"
  | "melancholic";

export interface ActionItem {
  text: string;
  dueDate?: string;
  completed: boolean;
}

export interface ThoughtAnalysis {
  title: string;
  summary: string;
  category: "WORK" | "IDEAS" | "EMOTIONS" | "DAILY" | "LEARNING" | "RELATIONSHIPS" | "HEALTH" | "FINANCE" | "DREAMS";
  tags: string[];
  keywords: string[];
  importance: number;
  emotion: EmotionType;
  emotionSecondary?: EmotionType;
  valence: number;
  confidence: number;
  actionItems: ActionItem[];
  peopleMentioned: string[];
  placesMentioned: string[];
}
