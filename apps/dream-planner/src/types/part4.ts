import type { ActivityMeta } from "./planner";

// ── PART 4 Activities ──
export const PART4_ACTIVITIES: ActivityMeta[] = [
  {
    id: 15,
    title: "First 10 Fans",
    shortTitle: "10 Fans",
    description: "Identify and nurture your first 10 fans.",
  },
  {
    id: 16,
    title: "Dream 5 Network",
    shortTitle: "Dream 5",
    description: "Build your core network of 5 key people.",
  },
  {
    id: 17,
    title: "First Rejection Collection",
    shortTitle: "Rejections",
    description: "Collect rejections to build resilience.",
  },
  {
    id: 18,
    title: "Sustainable System",
    shortTitle: "System",
    description: "Design a system you can sustain long-term.",
  },
  {
    id: 19,
    title: "Traffic Light Analysis",
    shortTitle: "Traffic Light",
    description: "Categorize activities as green, yellow, or red.",
  },
  {
    id: 20,
    title: "Sustainability Checklist",
    shortTitle: "Checklist",
    description: "Check your financial, mental, and social health.",
  },
];

// ── Activity 15: First 10 Fans ──
export type FanStage =
  | "candidate"
  | "contact"
  | "value"
  | "response"
  | "fan";

export const FAN_STAGES: { key: FanStage; label: string }[] = [
  { key: "candidate", label: "Candidate" },
  { key: "contact", label: "Contacted" },
  { key: "value", label: "Value Given" },
  { key: "response", label: "Response" },
  { key: "fan", label: "Fan" },
];

export interface FanCandidate {
  id: string;
  name: string;
  where: string;
  problem: string;
  stage: FanStage;
  notes: string;
}

// ── Activity 16: Dream 5 Network ──
export type Dream5Role = "mentor" | "peer" | "partner";

export interface Dream5Member {
  id: string;
  name: string;
  role: Dream5Role;
  reason: string;
  valueExchange: string;
  contact: string;
  journalEntries: { date: string; note: string }[];
}

export interface Dream5NetworkData {
  members: Dream5Member[];
}

// ── Activity 17: First Rejection Collection ──
export interface RejectionChallenge {
  id: string;
  attempt: string;
  expectedReaction: string;
  actualReaction: string;
  emotion: string;
  lesson: string;
  completed: boolean;
}

export const REJECTION_IDEAS = [
  "Ask for a discount at a coffee shop",
  "Request feedback from a stranger on your idea",
  "Ask someone you admire for 5 minutes of their time",
  "Pitch your dream to a friend who might say no",
  "Ask a local business for a collaboration",
  "Request a meeting with someone outside your network",
];

// ── Activity 18: Sustainable System ──
export interface CoreActivity {
  id: string;
  name: string;
  time: string;
  space: string;
  rule: string;
}

export interface DistractionItem {
  id: string;
  distraction: string;
  blocker: string;
}

export interface RewardItem {
  id: string;
  period: "daily" | "weekly" | "monthly";
  reward: string;
}

export interface HabitCheck {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface SustainableSystemData {
  coreActivities: CoreActivity[];
  distractions: DistractionItem[];
  rewards: RewardItem[];
  habitChecks: HabitCheck[];
}

// ── Activity 19: Traffic Light Analysis ──
export type TrafficColor = "green" | "red" | "yellow";

export interface TrafficItem {
  id: string;
  text: string;
  color: TrafficColor;
  actionPlan: string;
}

export interface TrafficLightData {
  items: TrafficItem[];
}

export const TRAFFIC_COLORS: Record<
  TrafficColor,
  { label: string; bg: string; text: string; description: string }
> = {
  green: {
    label: "Continue",
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    description: "Keep doing this",
  },
  red: {
    label: "Stop",
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    description: "Stop doing this",
  },
  yellow: {
    label: "Improve",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-700 dark:text-yellow-300",
    description: "Improve or change this",
  },
};

// ── Activity 20: Sustainability Checklist ──
export type ChecklistDomain = "financial" | "mental" | "social";
export type ChecklistAnswer = "yes" | "no" | "needs_improvement";

export interface ChecklistQuestion {
  id: string;
  domain: ChecklistDomain;
  question: string;
  answer: ChecklistAnswer | "";
  improvementPlan: string;
}

export const CHECKLIST_QUESTIONS: Omit<
  ChecklistQuestion,
  "answer" | "improvementPlan"
>[] = [
  // Financial
  { id: "f1", domain: "financial", question: "Can you sustain this for 6 months without income?" },
  { id: "f2", domain: "financial", question: "Do you have a backup plan if revenue takes longer?" },
  { id: "f3", domain: "financial", question: "Are your expenses aligned with your dream priorities?" },
  { id: "f4", domain: "financial", question: "Can you cover basic needs while building your dream?" },
  // Mental
  { id: "m1", domain: "mental", question: "Do you have a healthy work-rest routine?" },
  { id: "m2", domain: "mental", question: "Can you handle setbacks without burning out?" },
  { id: "m3", domain: "mental", question: "Do you have someone to talk to when things get hard?" },
  { id: "m4", domain: "mental", question: "Are you motivated by purpose, not just pressure?" },
  // Social
  { id: "s1", domain: "social", question: "Does your close circle support your dream?" },
  { id: "s2", domain: "social", question: "Have you communicated your plans to key people?" },
  { id: "s3", domain: "social", question: "Do you have at least one accountability partner?" },
  { id: "s4", domain: "social", question: "Can you maintain important relationships while pursuing this?" },
];

export interface SustainabilityData {
  questions: ChecklistQuestion[];
}

// ── PART 4 Reflection ──
export const PART4_REFLECTION_QUESTIONS = [
  "What did you learn about building genuine relationships with fans?",
  "How did collecting rejections change your mindset?",
  "Which part of your sustainable system are you most excited about?",
  "What is the biggest risk to your dream, and how will you mitigate it?",
  "Looking back at all 4 PARTs, what is your #1 takeaway?",
];

// ── PART 4 Aggregate Data ──
export interface Part4Data {
  currentActivity: number;
  completedActivities: number[];
  fanCandidates: FanCandidate[];
  dream5Network: Dream5NetworkData;
  rejectionChallenges: RejectionChallenge[];
  sustainableSystem: SustainableSystemData;
  trafficLight: TrafficLightData;
  sustainabilityChecklist: SustainabilityData;
  reflectionAnswers: string[];
}

export const DEFAULT_PART4_DATA: Part4Data = {
  currentActivity: 15,
  completedActivities: [],
  fanCandidates: [],
  dream5Network: { members: [] },
  rejectionChallenges: [
    { id: "r1", attempt: "", expectedReaction: "", actualReaction: "", emotion: "", lesson: "", completed: false },
    { id: "r2", attempt: "", expectedReaction: "", actualReaction: "", emotion: "", lesson: "", completed: false },
    { id: "r3", attempt: "", expectedReaction: "", actualReaction: "", emotion: "", lesson: "", completed: false },
  ],
  sustainableSystem: {
    coreActivities: [],
    distractions: [],
    rewards: [],
    habitChecks: [],
  },
  trafficLight: { items: [] },
  sustainabilityChecklist: {
    questions: CHECKLIST_QUESTIONS.map((q) => ({
      ...q,
      answer: "",
      improvementPlan: "",
    })),
  },
  reflectionAnswers: PART4_REFLECTION_QUESTIONS.map(() => ""),
};
