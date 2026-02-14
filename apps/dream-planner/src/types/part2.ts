import type { ActivityMeta } from "./planner";
import type { Node, Edge } from "@xyflow/react";

// ── PART 2 Activities ──
export const PART2_ACTIVITIES: ActivityMeta[] = [
  {
    id: 6,
    title: "Experience Mind Map",
    shortTitle: "Mind Map",
    description: "Visualize your life experiences as an interactive map.",
  },
  {
    id: 7,
    title: "Failure Resume",
    shortTitle: "Failures",
    description: "Turn your failures into lessons and growth fuel.",
  },
  {
    id: 8,
    title: "Strengths & Weaknesses Redefine",
    shortTitle: "Strengths",
    description: "Reframe your weaknesses as hidden strengths.",
  },
  {
    id: 9,
    title: "30-Minute Market Scan",
    shortTitle: "Market Scan",
    description: "Quickly explore market signals in 30 minutes.",
  },
  {
    id: 10,
    title: "Why-What Bridge & Idea Twist",
    shortTitle: "Why-What",
    description: "Bridge your Why to actionable ideas.",
  },
  {
    id: 21,
    title: "Traffic Light Analysis",
    shortTitle: "Traffic Light",
    description: "Categorize factors into Stop, Caution, and Go to assess your dream.",
  },
];

// ── Activity 6: Experience Mind Map ──
export const DEFAULT_MIND_MAP_BRANCHES = [
  "School",
  "Career",
  "Travel",
  "Hobbies",
  "Relationships",
];

// ── Activity 7: Failure Resume ──
export type EmotionTag =
  | "frustration"
  | "anger"
  | "regret"
  | "growth"
  | "relief"
  | "acceptance";

export const EMOTION_TAGS: { key: EmotionTag; label: string; color: string }[] =
  [
    { key: "frustration", label: "Frustration", color: "#ef4444" },
    { key: "anger", label: "Anger", color: "#f97316" },
    { key: "regret", label: "Regret", color: "#eab308" },
    { key: "growth", label: "Growth", color: "#22c55e" },
    { key: "relief", label: "Relief", color: "#3b82f6" },
    { key: "acceptance", label: "Acceptance", color: "#8b5cf6" },
  ];

export interface FailureEntry {
  id: string;
  year: string;
  experience: string;
  lesson: string;
  emotions: EmotionTag[];
}

// ── Activity 8: Strengths & Weaknesses Redefine ──
export interface WeaknessItem {
  id: string;
  text: string;
  reframed: string;
}

// ── Activity 9: 30-Minute Market Scan ──
export interface ScanNote {
  id: string;
  text: string;
  type: "discovery" | "reaction" | "missed";
}

export interface MarketScanData {
  youtube: ScanNote[];
  bookstore: ScanNote[];
  community: ScanNote[];
}

export type ScanTab = "youtube" | "bookstore" | "community";

export const SCAN_TAB_LABELS: Record<ScanTab, string> = {
  youtube: "YouTube",
  bookstore: "Bookstore",
  community: "Community",
};

// ── Activity 10: Why-What Bridge ──
export interface IdeaTwist {
  subtract: string;
  add: string;
  combine: string;
  reverse: string;
}

export interface WhyWhatBridgeData {
  why: string;
  ideas: string[];
  twists: IdeaTwist[];
  scores: { feasibility: number; market: number; passion: number }[];
  selectedIndex: number;
  selectionReason: string;
}

// ── PART 2 Reflection ──
export const PART2_REFLECTION_QUESTIONS = [
  "What pattern did you discover across your experiences and failures?",
  "Which reframed weakness excites you the most? Why?",
  "What market signal surprised you during the scan?",
  "How has your dream evolved after completing PART 2?",
  "What is one idea you want to pursue further?",
];

// ── PART 2 Aggregate Data ──
export interface Part2Data {
  currentActivity: number;
  completedActivities: number[];
  mindMapNodes: Node[];
  mindMapEdges: Edge[];
  failureEntries: FailureEntry[];
  strengths: string[];
  weaknesses: WeaknessItem[];
  marketScan: MarketScanData;
  whyWhatBridge: WhyWhatBridgeData;
  reflectionAnswers: string[];
}

export const DEFAULT_PART2_DATA: Part2Data = {
  currentActivity: 6,
  completedActivities: [],
  mindMapNodes: [],
  mindMapEdges: [],
  failureEntries: [],
  strengths: [],
  weaknesses: [],
  marketScan: { youtube: [], bookstore: [], community: [] },
  whyWhatBridge: {
    why: "",
    ideas: ["", "", ""],
    twists: [
      { subtract: "", add: "", combine: "", reverse: "" },
      { subtract: "", add: "", combine: "", reverse: "" },
      { subtract: "", add: "", combine: "", reverse: "" },
    ],
    scores: [
      { feasibility: 3, market: 3, passion: 3 },
      { feasibility: 3, market: 3, passion: 3 },
      { feasibility: 3, market: 3, passion: 3 },
    ],
    selectedIndex: -1,
    selectionReason: "",
  },
  reflectionAnswers: PART2_REFLECTION_QUESTIONS.map(() => ""),
};
