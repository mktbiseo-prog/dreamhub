// ---------------------------------------------------------------------------
// Dream Brain — Pattern Discovery Engine
//
// Discovers patterns across a user's thoughts:
// - Recurring themes (keywords appearing 3+ times in a week)
// - Temporal patterns (thinking about X on certain days/times)
// - Emotional patterns (mood correlations with topics)
// - Growth patterns (topic evolution over time)
// - Connection patterns (frequently co-occurring topics)
// ---------------------------------------------------------------------------

import { analyzeTone, type ToneName } from "./tone-analyzer";

export type PatternType =
  | "recurring_theme"
  | "temporal"
  | "emotional"
  | "growth"
  | "connection";

export interface PatternInsight {
  type: PatternType;
  title: string;
  description: string;
  confidence: number; // 0-1
  relatedIds: string[];
  actionable: string | null;
}

export interface ThoughtForPattern {
  id: string;
  title: string;
  body: string;
  tags: string[];
  keywords: string[];
  category: string;
  createdAt: string;
  emotion?: string;
  valence?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════════════════════

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour < 6) return "late night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function extractAllKeywords(thought: ThoughtForPattern): string[] {
  const words = new Set<string>();
  for (const tag of thought.tags) {
    words.add(tag.toLowerCase());
  }
  for (const kw of thought.keywords) {
    words.add(kw.toLowerCase());
  }
  return [...words];
}

// ═══════════════════════════════════════════════════════════════════════════
// Pattern: Recurring Themes
// ═══════════════════════════════════════════════════════════════════════════

export function getRecurringThemes(
  thoughts: ThoughtForPattern[]
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  // Group thoughts by week
  const weeklyKeywords: Record<string, { keyword: string; ids: string[] }[]> = {};

  for (const thought of thoughts) {
    const date = new Date(thought.createdAt);
    const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
    if (!weeklyKeywords[weekKey]) weeklyKeywords[weekKey] = [];

    const keywords = extractAllKeywords(thought);
    for (const kw of keywords) {
      const existing = weeklyKeywords[weekKey].find(
        (entry) => entry.keyword === kw
      );
      if (existing) {
        if (!existing.ids.includes(thought.id)) {
          existing.ids.push(thought.id);
        }
      } else {
        weeklyKeywords[weekKey].push({ keyword: kw, ids: [thought.id] });
      }
    }
  }

  // Find keywords appearing 3+ times in any week
  for (const [, entries] of Object.entries(weeklyKeywords)) {
    for (const entry of entries) {
      if (entry.ids.length >= 3) {
        insights.push({
          type: "recurring_theme",
          title: `Recurring: "${entry.keyword}"`,
          description: `You mentioned "${entry.keyword}" ${entry.ids.length} times this week. This seems to be a significant topic on your mind.`,
          confidence: Math.min(entry.ids.length / 5, 1),
          relatedIds: entry.ids,
          actionable: `Consider creating a dedicated project or goal around "${entry.keyword}".`,
        });
      }
    }
  }

  // Deduplicate by keyword (keep highest confidence)
  const seen = new Set<string>();
  return insights.filter((insight) => {
    const key = insight.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Pattern: Temporal
// ═══════════════════════════════════════════════════════════════════════════

export function getTemporalPatterns(
  thoughts: ThoughtForPattern[]
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  // Analyze day-of-week distribution per category
  const categoryDayMap: Record<string, Record<number, string[]>> = {};

  for (const thought of thoughts) {
    const day = new Date(thought.createdAt).getDay();
    const cat = thought.category;
    if (!categoryDayMap[cat]) categoryDayMap[cat] = {};
    if (!categoryDayMap[cat][day]) categoryDayMap[cat][day] = [];
    categoryDayMap[cat][day].push(thought.id);
  }

  for (const [category, dayMap] of Object.entries(categoryDayMap)) {
    const entries = Object.entries(dayMap).map(([day, ids]) => ({
      day: Number(day),
      count: ids.length,
      ids,
    }));

    const totalForCategory = entries.reduce((sum, e) => sum + e.count, 0);
    if (totalForCategory < 3) continue;

    const sorted = entries.sort((a, b) => b.count - a.count);
    const peakDay = sorted[0];

    // If peak day has significantly more thoughts than average
    const avgPerDay = totalForCategory / 7;
    if (peakDay.count >= avgPerDay * 2 && peakDay.count >= 2) {
      insights.push({
        type: "temporal",
        title: `${category} on ${DAY_NAMES[peakDay.day]}s`,
        description: `You tend to think about ${category.toLowerCase()} most on ${DAY_NAMES[peakDay.day]}s (${peakDay.count} thoughts).`,
        confidence: Math.min(peakDay.count / totalForCategory, 0.95),
        relatedIds: peakDay.ids,
        actionable: `Block time on ${DAY_NAMES[peakDay.day]}s for focused ${category.toLowerCase()} thinking.`,
      });
    }
  }

  // Analyze time-of-day patterns
  const timeMap: Record<string, string[]> = {};
  for (const thought of thoughts) {
    const time = getTimeOfDay(new Date(thought.createdAt));
    if (!timeMap[time]) timeMap[time] = [];
    timeMap[time].push(thought.id);
  }

  const timeSorted = Object.entries(timeMap).sort(
    (a, b) => b[1].length - a[1].length
  );
  if (timeSorted.length > 0 && timeSorted[0][1].length >= 3) {
    const [peakTime, ids] = timeSorted[0];
    const pct = Math.round((ids.length / thoughts.length) * 100);
    insights.push({
      type: "temporal",
      title: `Peak thinking time: ${peakTime}`,
      description: `${pct}% of your thoughts are captured in the ${peakTime}. This is your most creative period.`,
      confidence: Math.min(pct / 100 + 0.3, 0.95),
      relatedIds: ids.slice(0, 5),
      actionable: `Use ${peakTime} hours for important reflection and ideation.`,
    });
  }

  return insights;
}

// ═══════════════════════════════════════════════════════════════════════════
// Pattern: Emotional
// ═══════════════════════════════════════════════════════════════════════════

export function getEmotionalPatterns(
  thoughts: ThoughtForPattern[]
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  // Correlate categories with emotions/valence
  const categoryEmotions: Record<
    string,
    { totalValence: number; count: number; ids: string[]; dominantTones: ToneName[] }
  > = {};

  for (const thought of thoughts) {
    const cat = thought.category;
    if (!categoryEmotions[cat]) {
      categoryEmotions[cat] = { totalValence: 0, count: 0, ids: [], dominantTones: [] };
    }

    const tone = analyzeTone(thought.body);
    categoryEmotions[cat].totalValence += thought.valence ?? tone.valence;
    categoryEmotions[cat].count += 1;
    categoryEmotions[cat].ids.push(thought.id);
    categoryEmotions[cat].dominantTones.push(tone.dominant);
  }

  for (const [category, data] of Object.entries(categoryEmotions)) {
    if (data.count < 2) continue;

    const avgValence = data.totalValence / data.count;

    if (avgValence < -0.2) {
      insights.push({
        type: "emotional",
        title: `${category} feels stressful`,
        description: `Your mood tends to drop when thinking about ${category.toLowerCase()}. Average emotional valence: ${avgValence.toFixed(2)}.`,
        confidence: Math.min(data.count / 5, 0.9),
        relatedIds: data.ids.slice(0, 5),
        actionable: `Consider what aspects of ${category.toLowerCase()} are causing stress, and break them into smaller, manageable tasks.`,
      });
    } else if (avgValence > 0.5) {
      insights.push({
        type: "emotional",
        title: `${category} energizes you`,
        description: `Your mood tends to rise when thinking about ${category.toLowerCase()}. Average emotional valence: +${avgValence.toFixed(2)}.`,
        confidence: Math.min(data.count / 5, 0.9),
        relatedIds: data.ids.slice(0, 5),
        actionable: `Lean into ${category.toLowerCase()} activities for motivation boosts.`,
      });
    }
  }

  return insights;
}

// ═══════════════════════════════════════════════════════════════════════════
// Pattern: Growth
// ═══════════════════════════════════════════════════════════════════════════

export function getGrowthPatterns(
  thoughts: ThoughtForPattern[]
): PatternInsight[] {
  const insights: PatternInsight[] = [];
  if (thoughts.length < 4) return insights;

  // Sort chronologically
  const sorted = [...thoughts].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Split into halves (earlier vs. later)
  const midpoint = Math.floor(sorted.length / 2);
  const earlier = sorted.slice(0, midpoint);
  const later = sorted.slice(midpoint);

  // Count categories in each half
  const countCategories = (items: ThoughtForPattern[]) => {
    const counts: Record<string, number> = {};
    for (const t of items) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  };

  const earlyCategories = countCategories(earlier);
  const lateCategories = countCategories(later);

  // Detect shifts
  const allCats = new Set([
    ...Object.keys(earlyCategories),
    ...Object.keys(lateCategories),
  ]);

  for (const cat of allCats) {
    const earlyCount = earlyCategories[cat] || 0;
    const lateCount = lateCategories[cat] || 0;
    const earlyPct = earlyCount / earlier.length;
    const latePct = lateCount / later.length;
    const shift = latePct - earlyPct;

    if (shift > 0.2 && lateCount >= 2) {
      insights.push({
        type: "growth",
        title: `Growing interest in ${cat}`,
        description: `You've been thinking more about ${cat.toLowerCase()} recently. It made up ${Math.round(latePct * 100)}% of recent thoughts, up from ${Math.round(earlyPct * 100)}%.`,
        confidence: Math.min(Math.abs(shift) + 0.3, 0.9),
        relatedIds: later
          .filter((t) => t.category === cat)
          .map((t) => t.id)
          .slice(0, 5),
        actionable: null,
      });
    } else if (shift < -0.2 && earlyCount >= 2) {
      insights.push({
        type: "growth",
        title: `Shifting away from ${cat}`,
        description: `You've been thinking less about ${cat.toLowerCase()} recently. It dropped from ${Math.round(earlyPct * 100)}% to ${Math.round(latePct * 100)}% of your thoughts.`,
        confidence: Math.min(Math.abs(shift) + 0.3, 0.9),
        relatedIds: earlier
          .filter((t) => t.category === cat)
          .map((t) => t.id)
          .slice(0, 5),
        actionable: null,
      });
    }
  }

  return insights;
}

// ═══════════════════════════════════════════════════════════════════════════
// Pattern: Connection (co-occurring topics)
// ═══════════════════════════════════════════════════════════════════════════

function getConnectionPatterns(
  thoughts: ThoughtForPattern[]
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  // Build co-occurrence matrix for keywords
  const coOccurrence: Record<string, Record<string, string[]>> = {};

  for (const thought of thoughts) {
    const keywords = extractAllKeywords(thought);
    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        const a = keywords[i];
        const b = keywords[j];
        const key = [a, b].sort().join("|");

        if (!coOccurrence[key]) coOccurrence[key] = { ids: [] as unknown as Record<string, string[]> } as unknown as Record<string, string[]>;
        // Using a simpler approach
        if (!coOccurrence[key]) {
          coOccurrence[key] = {};
        }
        if (!coOccurrence[key].ids) {
          coOccurrence[key].ids = [];
        }
      }
    }
  }

  // Simpler co-occurrence approach
  const pairCounts: Record<string, { count: number; ids: string[] }> = {};

  for (const thought of thoughts) {
    const keywords = extractAllKeywords(thought);
    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        const key = [keywords[i], keywords[j]].sort().join(" + ");
        if (!pairCounts[key]) pairCounts[key] = { count: 0, ids: [] };
        pairCounts[key].count += 1;
        if (!pairCounts[key].ids.includes(thought.id)) {
          pairCounts[key].ids.push(thought.id);
        }
      }
    }
  }

  // Report pairs appearing 3+ times
  for (const [pair, data] of Object.entries(pairCounts)) {
    if (data.count >= 3) {
      const [topicA, topicB] = pair.split(" + ");
      insights.push({
        type: "connection",
        title: `"${topicA}" and "${topicB}" are linked`,
        description: `Thoughts about "${topicA}" and "${topicB}" appear together ${data.count} times. These topics are closely related in your thinking.`,
        confidence: Math.min(data.count / 6, 0.95),
        relatedIds: data.ids.slice(0, 5),
        actionable: `Explore the connection between "${topicA}" and "${topicB}" — there may be an insight or opportunity here.`,
      });
    }
  }

  return insights
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Discover all patterns across a user's thoughts.
 * Returns an array of PatternInsight sorted by confidence.
 */
export function discoverPatterns(
  thoughts: ThoughtForPattern[]
): PatternInsight[] {
  if (thoughts.length < 2) return [];

  const allPatterns = [
    ...getRecurringThemes(thoughts),
    ...getTemporalPatterns(thoughts),
    ...getEmotionalPatterns(thoughts),
    ...getGrowthPatterns(thoughts),
    ...getConnectionPatterns(thoughts),
  ];

  // Sort by confidence descending, then by type
  return allPatterns.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return a.type.localeCompare(b.type);
  });
}
