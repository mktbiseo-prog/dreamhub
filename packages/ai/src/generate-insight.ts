import OpenAI from "openai";
import type { ActionItem } from "./types";

export interface InsightData {
  summary: string;
  categoryDistribution: Record<string, number>;
  topKeywords: string[];
  emotionBreakdown: Record<string, number>;
  emotionTrend: string;
  patterns: string[];
  actionRecommendations: string[];
  todayInsight: string;
}

interface ThoughtInput {
  category: string;
  emotion: string;
  keywords: string[];
  tags: string[];
  importance: number;
  actionItems: ActionItem[];
  createdAt: string;
  summary: string;
}

const INSIGHT_PROMPT = `You are Dream Brain's insight analyst. Given a collection of user's thoughts from a time period, generate a comprehensive insight report.

Return ONLY valid JSON with this exact shape:
{
  "summary": "2-3 sentence overview of the user's thought patterns and mental state",
  "categoryDistribution": {"WORK": 5, "IDEAS": 3, ...},
  "topKeywords": ["keyword1", "keyword2", ...],
  "emotionBreakdown": {"excited": 3, "calm": 2, ...},
  "emotionTrend": "One sentence describing emotional trend (e.g., 'Increasingly positive with growing excitement about new projects')",
  "patterns": ["Pattern 1 discovered", "Pattern 2 discovered", ...],
  "actionRecommendations": ["Recommendation 1", "Recommendation 2", ...],
  "todayInsight": "One motivational/reflective sentence based on recent patterns"
}

Rules:
- categoryDistribution: count of thoughts per category
- topKeywords: up to 8 most frequent keywords across all thoughts
- emotionBreakdown: count of each emotion
- patterns: 2-4 interesting patterns discovered (recurring themes, time-based patterns, connections)
- actionRecommendations: 2-4 actionable recommendations based on patterns
- todayInsight: A brief, personalized insight or encouragement based on recent activity`;

function getMockInsight(thoughts: ThoughtInput[], periodType: string): InsightData {
  // Aggregate category distribution
  const categoryDistribution: Record<string, number> = {};
  const emotionBreakdown: Record<string, number> = {};
  const keywordCounts: Record<string, number> = {};

  for (const t of thoughts) {
    const cat = t.category.toUpperCase();
    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;

    if (t.emotion) {
      emotionBreakdown[t.emotion] = (emotionBreakdown[t.emotion] || 0) + 1;
    }

    for (const kw of t.keywords) {
      keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
    }
  }

  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([kw]) => kw);

  const topEmotion = Object.entries(emotionBreakdown)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "calm";

  const topCategory = Object.entries(categoryDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "DAILY";

  const period = periodType === "weekly" ? "week" : "month";

  return {
    summary: `This ${period}, you recorded ${thoughts.length} thoughts across ${Object.keys(categoryDistribution).length} categories. Your primary focus has been on ${topCategory.toLowerCase()} topics, with a predominantly ${topEmotion} emotional tone.`,
    categoryDistribution,
    topKeywords,
    emotionBreakdown,
    emotionTrend: `Your emotional state has been mostly ${topEmotion} this ${period}, suggesting a ${topEmotion === "anxious" || topEmotion === "frustrated" ? "challenging" : "positive"} period overall.`,
    patterns: [
      `You tend to think most about ${topCategory.toLowerCase()}-related topics`,
      topKeywords.length > 2
        ? `Recurring themes: ${topKeywords.slice(0, 3).join(", ")}`
        : "You have diverse interests across multiple areas",
      `Your most common emotional state is "${topEmotion}"`,
      thoughts.filter((t) => t.importance >= 4).length > 0
        ? `${thoughts.filter((t) => t.importance >= 4).length} high-importance thoughts recorded — these deserve follow-up`
        : "Most thoughts are of moderate importance — consider setting bigger goals",
    ],
    actionRecommendations: [
      "Review your high-importance thoughts and create concrete action plans",
      "Consider journaling at different times of day to capture varied perspectives",
      `Explore the connection between your ${topCategory.toLowerCase()} thoughts and your long-term goals`,
      "Set aside 10 minutes weekly to review and reflect on your thought patterns",
    ],
    todayInsight: `Your thinking patterns show strong engagement with ${topCategory.toLowerCase()} topics. Keep building on this momentum — your best ideas often come from sustained focus.`,
  };
}

export async function generateInsight(
  thoughts: ThoughtInput[],
  periodType: string
): Promise<InsightData> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || thoughts.length === 0) {
    return getMockInsight(thoughts, periodType);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const thoughtSummaries = thoughts.map((t, i) =>
      `${i + 1}. [${t.category}] ${t.summary} (emotion: ${t.emotion}, importance: ${t.importance}, keywords: ${t.keywords.join(", ")})`
    ).join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: INSIGHT_PROMPT },
        {
          role: "user",
          content: `Period: ${periodType}\nTotal thoughts: ${thoughts.length}\n\nThoughts:\n${thoughtSummaries}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(content) as InsightData;

    // Validate
    if (!parsed.summary) parsed.summary = "No summary available.";
    if (!parsed.categoryDistribution) parsed.categoryDistribution = {};
    if (!Array.isArray(parsed.topKeywords)) parsed.topKeywords = [];
    if (!parsed.emotionBreakdown) parsed.emotionBreakdown = {};
    if (!parsed.emotionTrend) parsed.emotionTrend = "";
    if (!Array.isArray(parsed.patterns)) parsed.patterns = [];
    if (!Array.isArray(parsed.actionRecommendations)) parsed.actionRecommendations = [];
    if (!parsed.todayInsight) parsed.todayInsight = "Keep journaling to discover more insights!";

    return parsed;
  } catch (error) {
    console.error("[Dream Brain AI] Insight generation failed, using mock:", error);
    return getMockInsight(thoughts, periodType);
  }
}
