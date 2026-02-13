import type { ActivityMeta } from "./planner";

// ── PART 3 Activities ──
export const PART3_ACTIVITIES: ActivityMeta[] = [
  {
    id: 11,
    title: "One-Line Proposal",
    shortTitle: "Proposal",
    description: "Craft your value proposition in one sentence.",
  },
  {
    id: 12,
    title: "Hypothesis-Validation Board",
    shortTitle: "Hypothesis",
    description: "Test your assumptions with a structured board.",
  },
  {
    id: 13,
    title: "Zero-Cost MVP",
    shortTitle: "MVP",
    description: "Build and launch your first product for $0.",
  },
  {
    id: 14,
    title: "Value Ladder",
    shortTitle: "Value Ladder",
    description: "Design your product tiers from free to premium.",
  },
];

// ── Activity 11: One-Line Proposal ──
export interface ProposalInput {
  targets: string[];
  problems: string[];
  solutions: string[];
  differentiators: string[];
}

export interface ProposalCombo {
  id: string;
  target: string;
  problem: string;
  solution: string;
  differentiator: string;
  liked: boolean;
}

export interface OneLineProposalData {
  inputs: ProposalInput;
  combos: ProposalCombo[];
  finalProposal: string;
}

// ── Activity 12: Hypothesis Board ──
export type HypothesisStatus = "pending" | "in_progress" | "success" | "fail";

export interface HypothesisItem {
  id: string;
  hypothesis: string;
  method: string;
  successCriteria: string;
  result: string;
  lesson: string;
  status: HypothesisStatus;
}

// ── Activity 13: Zero-Cost MVP ──
export type MvpType =
  | "landing_page"
  | "pre_signup"
  | "sns_campaign"
  | "manual_service";

export const MVP_TYPE_LABELS: Record<MvpType, string> = {
  landing_page: "Landing Page",
  pre_signup: "Pre-signup",
  sns_campaign: "SNS Campaign",
  manual_service: "Manual Service",
};

export interface MvpStep {
  id: string;
  text: string;
  done: boolean;
}

export interface MvpPlanData {
  mvpType: MvpType | "";
  steps: MvpStep[];
  promotions: string[];
  successCriteria: string;
  challenges: string;
  solutions: string;
  retrospective: string;
}

// ── Activity 14: Value Ladder ──
export type LadderTier = "freebie" | "low" | "mid" | "high";

export const LADDER_TIERS: { key: LadderTier; label: string; color: string }[] =
  [
    { key: "freebie", label: "Freebie", color: "#22c55e" },
    { key: "low", label: "Low Tier", color: "#3b82f6" },
    { key: "mid", label: "Mid Tier", color: "#8b5cf6" },
    { key: "high", label: "High Tier", color: "#f59e0b" },
  ];

export interface ValueLadderStep {
  tier: LadderTier;
  productName: string;
  price: number;
  customerValue: string;
}

// ── PART 3 Reflection ──
export const PART3_REFLECTION_QUESTIONS = [
  "Which one-line proposal resonates most with your dream?",
  "What did you learn from validating your hypotheses?",
  "How did building a zero-cost MVP change your perspective?",
  "What surprised you about pricing your value ladder?",
  "What is the most important next step for your dream?",
];

// ── PART 3 Aggregate Data ──
export interface Part3Data {
  currentActivity: number;
  completedActivities: number[];
  oneLineProposal: OneLineProposalData;
  hypotheses: HypothesisItem[];
  mvpPlan: MvpPlanData;
  valueLadder: ValueLadderStep[];
  reflectionAnswers: string[];
}

export const DEFAULT_PART3_DATA: Part3Data = {
  currentActivity: 11,
  completedActivities: [],
  oneLineProposal: {
    inputs: { targets: [""], problems: [""], solutions: [""], differentiators: [""] },
    combos: [],
    finalProposal: "",
  },
  hypotheses: [
    {
      id: "h1",
      hypothesis: "",
      method: "",
      successCriteria: "",
      result: "",
      lesson: "",
      status: "pending",
    },
    {
      id: "h2",
      hypothesis: "",
      method: "",
      successCriteria: "",
      result: "",
      lesson: "",
      status: "pending",
    },
    {
      id: "h3",
      hypothesis: "",
      method: "",
      successCriteria: "",
      result: "",
      lesson: "",
      status: "pending",
    },
  ],
  mvpPlan: {
    mvpType: "",
    steps: [],
    promotions: ["", "", "", "", ""],
    successCriteria: "",
    challenges: "",
    solutions: "",
    retrospective: "",
  },
  valueLadder: [
    { tier: "freebie", productName: "", price: 0, customerValue: "" },
    { tier: "low", productName: "", price: 0, customerValue: "" },
    { tier: "mid", productName: "", price: 0, customerValue: "" },
    { tier: "high", productName: "", price: 0, customerValue: "" },
  ],
  reflectionAnswers: PART3_REFLECTION_QUESTIONS.map(() => ""),
};
