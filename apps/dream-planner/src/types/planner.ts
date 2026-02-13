// ── Activity Navigation ──
export interface ActivityMeta {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
}

export const PART1_ACTIVITIES: ActivityMeta[] = [
  {
    id: 1,
    title: "Skills & Experience Inventory",
    shortTitle: "Skills",
    description: "List everything you know and have done.",
  },
  {
    id: 2,
    title: "Resource Map",
    shortTitle: "Resources",
    description: "Assess your 6 key resources.",
  },
  {
    id: 3,
    title: "Time Log",
    shortTitle: "Time",
    description: "Observe how you spend your time.",
  },
  {
    id: 4,
    title: "Money Flow",
    shortTitle: "Money",
    description: "Understand your spending patterns.",
  },
  {
    id: 5,
    title: "Define My Current State",
    shortTitle: "Current State",
    description: "Define where you are right now.",
  },
];

// ── Activity 1: Skills Inventory ──
export type SkillCategory = "work" | "personal" | "learning";

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  proficiency: number; // 1-5
  category: SkillCategory;
}

export const SKILL_TABS: { key: SkillCategory; label: string }[] = [
  { key: "work", label: "Work Experience" },
  { key: "personal", label: "Personal Skills" },
  { key: "learning", label: "Learning Experience" },
];

// ── Activity 2: Resource Map ──
export type ResourceKey =
  | "financial"
  | "time"
  | "skills"
  | "experience"
  | "people"
  | "physical";

export interface ResourceItem {
  key: ResourceKey;
  label: string;
  score: number; // 1-5
  description: string;
}

export const RESOURCE_DEFAULTS: ResourceItem[] = [
  { key: "financial", label: "Financial", score: 0, description: "" },
  { key: "time", label: "Time", score: 0, description: "" },
  { key: "skills", label: "Skills & Knowledge", score: 0, description: "" },
  { key: "experience", label: "Experience", score: 0, description: "" },
  { key: "people", label: "People", score: 0, description: "" },
  { key: "physical", label: "Physical", score: 0, description: "" },
];

// ── Activity 3: Time Log ──
export type TimeBlockType = "productive" | "consumption" | "essential";

export interface TimeBlock {
  id: string;
  day: number; // 0=Mon, 6=Sun
  startHour: number; // 0-23
  duration: number; // hours (0.5 increments)
  activity: string;
  type: TimeBlockType;
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const TIME_BLOCK_COLORS: Record<TimeBlockType, string> = {
  productive: "#22c55e",
  consumption: "#eab308",
  essential: "#9ca3af",
};

// ── Activity 4: Money Flow ──
export type SatisfactionLevel = "high" | "medium" | "low";

export interface ExpenseItem {
  id: string;
  date: string;
  item: string;
  category: string;
  amount: number;
  satisfaction: SatisfactionLevel;
}

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Self-Development",
  "Entertainment",
  "Housing",
  "Health",
  "Subscriptions",
  "Other",
];

export const SATISFACTION_COLORS: Record<SatisfactionLevel, string> = {
  high: "#22c55e",
  medium: "#eab308",
  low: "#ef4444",
};

// ── Activity 5: Current State ──
export interface CurrentStateCard {
  key: string;
  title: string;
  placeholder: string;
  icon: string;
  content: string;
}

export const CURRENT_STATE_DEFAULTS: CurrentStateCard[] = [
  {
    key: "job",
    title: "Job & Affiliation",
    placeholder: "What do you do? Where do you belong?",
    icon: "briefcase",
    content: "",
  },
  {
    key: "role",
    title: "Roles & Responsibilities",
    placeholder: "What are you responsible for?",
    icon: "users",
    content: "",
  },
  {
    key: "constraints",
    title: "Constraints",
    placeholder: "What limits you right now?",
    icon: "lock",
    content: "",
  },
  {
    key: "concerns",
    title: "Concerns & Stress",
    placeholder: "What keeps you up at night?",
    icon: "cloud",
    content: "",
  },
  {
    key: "opportunities",
    title: "Opportunities",
    placeholder: "What doors are open to you?",
    icon: "sun",
    content: "",
  },
];

// ── Version History ──
export interface VersionSnapshot {
  id: string;
  timestamp: string;
  label: string; // e.g. "Completed Activity 3: Time Log"
  metrics: {
    skillCount: number;
    resourceAvg: number;
    productiveHours: number;
    consumptionHours: number;
    totalExpenses: number;
    lowSatExpenses: number;
    completedActivities: number;
    dreamStatement: string;
    streak: number;
    // PART 2-4 metrics
    mindMapNodes: number;
    failureEntries: number;
    strengthsCount: number;
    whyStatement: string;
    selectedIdea: string;
    finalProposal: string;
    hypothesesTested: number;
    hypothesesSucceeded: number;
    mvpProgress: number;
    valueLadderFilled: number;
    fanCandidates: number;
    fansConverted: number;
    dream5Members: number;
    rejectionsCompleted: number;
    sustainabilityScore: number;
  };
}

// ── Reflection ──
export interface ReflectionAnswer {
  question: string;
  answer: string;
}

export const PART1_REFLECTION_QUESTIONS = [
  "What surprised you the most about yourself during PART 1?",
  "Which activity did you skip or rush through? Why?",
  "What is the smallest success you discovered?",
  "What is the biggest lesson you learned?",
  "What do you want to focus on in the next PART?",
];
