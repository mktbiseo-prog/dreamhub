export interface WorkStyleQuestion {
  id: number;
  question: string;
  lowLabel: string;
  highLabel: string;
  dimension: "ideation" | "execution" | "people" | "thinking" | "action";
}

/**
 * 10 questions mapped to 5 Belbin-inspired dimensions.
 * Each dimension has 2 questions for reliability.
 * Scale: 1-5 Likert → normalized to 0-100.
 */
export const WORK_STYLE_QUESTIONS: WorkStyleQuestion[] = [
  // Ideation (Plant, Specialist)
  {
    id: 1,
    question: "I come up with original ideas and creative solutions that others might not think of.",
    lowLabel: "Rarely",
    highLabel: "Very often",
    dimension: "ideation",
  },
  {
    id: 2,
    question: "I enjoy exploring new concepts and brainstorming without constraints.",
    lowLabel: "Not at all",
    highLabel: "Absolutely",
    dimension: "ideation",
  },

  // Execution (Implementer, Completer Finisher)
  {
    id: 3,
    question: "I'm good at turning plans into action and getting things done on time.",
    lowLabel: "Rarely",
    highLabel: "Always",
    dimension: "execution",
  },
  {
    id: 4,
    question: "I pay attention to details and make sure nothing falls through the cracks.",
    lowLabel: "Not my strength",
    highLabel: "Definitely me",
    dimension: "execution",
  },

  // People (Coordinator, Teamworker, Resource Investigator)
  {
    id: 5,
    question: "I naturally bring people together and help coordinate team efforts.",
    lowLabel: "Rarely",
    highLabel: "Very often",
    dimension: "people",
  },
  {
    id: 6,
    question: "I enjoy networking, building relationships, and connecting people with opportunities.",
    lowLabel: "Not at all",
    highLabel: "Love it",
    dimension: "people",
  },

  // Thinking (Monitor Evaluator, Specialist)
  {
    id: 7,
    question: "I prefer to analyze options carefully before making decisions.",
    lowLabel: "Act first",
    highLabel: "Think first",
    dimension: "thinking",
  },
  {
    id: 8,
    question: "I value deep expertise and thorough research over quick conclusions.",
    lowLabel: "Speed over depth",
    highLabel: "Depth over speed",
    dimension: "thinking",
  },

  // Action (Shaper, Implementer)
  {
    id: 9,
    question: "I push through challenges and keep the team focused on goals under pressure.",
    lowLabel: "Not my role",
    highLabel: "That's me",
    dimension: "action",
  },
  {
    id: 10,
    question: "I'm comfortable making tough decisions quickly and driving momentum.",
    lowLabel: "Rarely",
    highLabel: "Always",
    dimension: "action",
  },
];

/**
 * Convert raw answers (1-5 per question) to WorkStyle scores (0-100 per dimension).
 * Two questions per dimension → average then scale to 0-100.
 */
export function computeWorkStyleScores(
  answers: Record<number, number>
): Record<string, number> {
  const dims: Record<string, number[]> = {
    ideation: [],
    execution: [],
    people: [],
    thinking: [],
    action: [],
  };

  for (const q of WORK_STYLE_QUESTIONS) {
    const val = answers[q.id] ?? 3; // default to neutral
    dims[q.dimension].push(val);
  }

  const result: Record<string, number> = {};
  for (const [dim, values] of Object.entries(dims)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    // Scale 1-5 to 0-100
    result[dim] = Math.round(((avg - 1) / 4) * 100);
  }

  return result;
}
