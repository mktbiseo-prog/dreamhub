export interface ThoughtAnalysis {
  title: string;
  summary: string;
  category: "WORK" | "IDEAS" | "EMOTIONS" | "DAILY" | "LEARNING" | "RELATIONSHIPS" | "HEALTH" | "FINANCE" | "DREAMS";
  tags: string[];
  keywords: string[];
  importance: number;
}
