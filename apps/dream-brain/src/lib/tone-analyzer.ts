// ---------------------------------------------------------------------------
// Dream Brain — Tone / Emotion Analyzer
//
// Client-side keyword/pattern matching approach for 5 tone dimensions.
// No external AI calls required — works offline and instantly.
// ---------------------------------------------------------------------------

export interface ToneDimensions {
  confident: number;   // 0-1
  anxious: number;     // 0-1
  excited: number;     // 0-1
  reflective: number;  // 0-1
  determined: number;  // 0-1
}

export type ToneName = keyof ToneDimensions;

export interface ToneResult {
  dimensions: ToneDimensions;
  dominant: ToneName;
  secondary: ToneName;
  valence: number; // -1 to 1
}

export interface EmotionalShift {
  from: ToneName;
  to: ToneName;
  date: string;
  magnitude: number; // 0-1
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Pattern dictionaries
// ═══════════════════════════════════════════════════════════════════════════

const TONE_PATTERNS: Record<ToneName, RegExp[]> = {
  confident: [
    /\b(confident|certain|sure|definitely|absolutely|no doubt|clearly|obviously|i know|i can|i will|strong|capable|ready|proven|succeed|achievement|accomplished|nailed|crushed it|killed it)\b/gi,
    /\b(believe in|trust my|stand by|commit to|guarantee|without question)\b/gi,
  ],
  anxious: [
    /\b(anxious|worried|nervous|stress|overwhelm|fear|afraid|uncertain|unsure|doubt|panic|dread|tense|uneasy|concerned|troubled|restless|can't sleep|what if|oh no)\b/gi,
    /\b(might fail|scared of|dreading|keeping me up|losing sleep|on edge|freaking out)\b/gi,
  ],
  excited: [
    /\b(excited|amazing|awesome|thrilled|can't wait|incredible|love it|fantastic|brilliant|wow|yes|pumped|stoked|hyped|enthusiastic|wonderful|great news|celebrate)\b/gi,
    /\b(looking forward|so happy|best day|finally|dream come true|breakthrough)\b/gi,
  ],
  reflective: [
    /\b(think|reflect|consider|wonder|maybe|perhaps|realize|understand|perspective|lesson|learn|insight|hindsight|looking back|ponder|contemplate|evaluate|assess)\b/gi,
    /\b(in retrospect|come to think|it occurs to me|i've been thinking|on reflection|deeper meaning)\b/gi,
  ],
  determined: [
    /\b(determined|focused|commit|driven|must|need to|going to|will do|no matter what|push through|persist|discipline|grind|hustle|relentless|unstoppable|dedicated|resolve)\b/gi,
    /\b(won't give up|keep going|stay the course|make it happen|no excuses|do whatever it takes)\b/gi,
  ],
};

const VALENCE_WEIGHTS: Record<ToneName, number> = {
  confident: 0.5,
  anxious: -0.6,
  excited: 0.8,
  reflective: 0.1,
  determined: 0.4,
};

// ═══════════════════════════════════════════════════════════════════════════
// Core Analysis
// ═══════════════════════════════════════════════════════════════════════════

function countMatches(text: string, patterns: RegExp[]): number {
  let count = 0;
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Analyze the tone of a given text using keyword/pattern matching.
 * Returns scores for 5 dimensions plus dominant and secondary tones.
 */
export function analyzeTone(text: string): ToneResult {
  const wordCount = text.split(/\s+/).length;
  const normalizer = Math.max(wordCount / 10, 1); // Normalize by text length

  const rawScores: ToneDimensions = {
    confident: 0,
    anxious: 0,
    excited: 0,
    reflective: 0,
    determined: 0,
  };

  // Count pattern matches for each dimension
  for (const [tone, patterns] of Object.entries(TONE_PATTERNS)) {
    const count = countMatches(text, patterns);
    rawScores[tone as ToneName] = Math.min(count / normalizer, 1);
  }

  // If all scores are 0, set a small baseline for reflective (default tone)
  const totalScore = Object.values(rawScores).reduce((a, b) => a + b, 0);
  if (totalScore === 0) {
    rawScores.reflective = 0.2;
  }

  // Find dominant and secondary tones
  const sorted = (Object.entries(rawScores) as [ToneName, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  const dominant = sorted[0][0];
  const secondary = sorted[1][1] > 0 ? sorted[1][0] : sorted[0][0];

  // Calculate valence as weighted average
  let valence = 0;
  let weightSum = 0;
  for (const [tone, score] of Object.entries(rawScores) as [ToneName, number][]) {
    if (score > 0) {
      valence += VALENCE_WEIGHTS[tone] * score;
      weightSum += score;
    }
  }
  valence = weightSum > 0 ? valence / weightSum : 0;
  valence = Math.max(-1, Math.min(1, valence));

  return {
    dimensions: rawScores,
    dominant,
    secondary,
    valence,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Emotional Shift Detection
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect significant emotional shifts across a series of thoughts.
 * Returns shifts where the dominant tone changes meaningfully.
 */
export function detectEmotionalShift(
  thoughts: { text: string; date: string }[]
): EmotionalShift[] {
  if (thoughts.length < 2) return [];

  const shifts: EmotionalShift[] = [];
  const sortedThoughts = [...thoughts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let prevTone = analyzeTone(sortedThoughts[0].text);

  for (let i = 1; i < sortedThoughts.length; i++) {
    const currentTone = analyzeTone(sortedThoughts[i].text);

    // Check if dominant tone has changed
    if (currentTone.dominant !== prevTone.dominant) {
      const magnitude = Math.abs(
        currentTone.dimensions[currentTone.dominant] -
          prevTone.dimensions[prevTone.dominant]
      );

      // Only report significant shifts (magnitude > 0.2)
      if (magnitude > 0.2) {
        const fromLabel = prevTone.dominant;
        const toLabel = currentTone.dominant;

        shifts.push({
          from: prevTone.dominant,
          to: currentTone.dominant,
          date: sortedThoughts[i].date,
          magnitude: Math.min(magnitude, 1),
          description: `Shifted from ${fromLabel} to ${toLabel}`,
        });
      }
    }

    prevTone = currentTone;
  }

  return shifts;
}

// ═══════════════════════════════════════════════════════════════════════════
// Utility: Get tone color for UI rendering
// ═══════════════════════════════════════════════════════════════════════════

export function getToneColor(tone: ToneName): string {
  const colors: Record<ToneName, string> = {
    confident: "#60a5fa",   // blue-400
    anxious: "#f87171",     // red-400
    excited: "#fbbf24",     // amber-400
    reflective: "#00D4AA",  // mint/teal
    determined: "#34d399",  // emerald-400
  };
  return colors[tone];
}

export function getToneTailwindColor(tone: ToneName): string {
  const colors: Record<ToneName, string> = {
    confident: "text-blue-400",
    anxious: "text-red-400",
    excited: "text-amber-400",
    reflective: "text-[#00D4AA]",
    determined: "text-emerald-400",
  };
  return colors[tone];
}

export function getToneBgColor(tone: ToneName): string {
  const colors: Record<ToneName, string> = {
    confident: "bg-blue-400/15",
    anxious: "bg-red-400/15",
    excited: "bg-amber-400/15",
    reflective: "bg-[#00D4AA]/15",
    determined: "bg-emerald-400/15",
  };
  return colors[tone];
}
