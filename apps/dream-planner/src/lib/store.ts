"use client";

import {
  useSyncExternalStore,
} from "react";
import type {
  SkillItem,
  ResourceItem,
  TimeBlock,
  ExpenseItem,
  CurrentStateCard,
  VersionSnapshot,
} from "@/types/planner";
import {
  RESOURCE_DEFAULTS,
  CURRENT_STATE_DEFAULTS,
  PART1_REFLECTION_QUESTIONS,
} from "@/types/planner";
import type { Part2Data } from "@/types/part2";
import { DEFAULT_PART2_DATA } from "@/types/part2";
import type { Part3Data } from "@/types/part3";
import { DEFAULT_PART3_DATA } from "@/types/part3";
import type { Part4Data } from "@/types/part4";
import { DEFAULT_PART4_DATA } from "@/types/part4";

// ── Types ──
export interface CoachInsight {
  id: string;
  timestamp: string;
  partNumber: number;
  activityId: number;
  activityName: string;
  message: string;
  type: "stuck" | "completion" | "entry" | "chat";
}

export interface PlannerData {
  // Meta
  onboarded: boolean;
  dreamStatement: string;
  userName: string;
  startedAt: string | null;
  lastVisitAt: string | null;
  streak: number;
  maxStreak: number;

  // PART 1
  skills: SkillItem[];
  resources: ResourceItem[];
  timeBlocks: TimeBlock[];
  expenses: ExpenseItem[];
  currentState: CurrentStateCard[];
  reflectionAnswers: string[];
  completedActivities: number[];
  currentActivity: number;

  // PART 2~4
  part2: Part2Data;
  part3: Part3Data;
  part4: Part4Data;

  // AI Coach
  recentInsights: CoachInsight[];

  // Version History
  versionHistory: VersionSnapshot[];
}

const DEFAULT_DATA: PlannerData = {
  onboarded: false,
  dreamStatement: "",
  userName: "",
  startedAt: null,
  lastVisitAt: null,
  streak: 0,
  maxStreak: 0,
  skills: [],
  resources: RESOURCE_DEFAULTS.map((r) => ({ ...r })),
  timeBlocks: [],
  expenses: [],
  currentState: CURRENT_STATE_DEFAULTS.map((c) => ({ ...c })),
  reflectionAnswers: PART1_REFLECTION_QUESTIONS.map(() => ""),
  completedActivities: [],
  currentActivity: 1,
  part2: { ...DEFAULT_PART2_DATA },
  part3: { ...DEFAULT_PART3_DATA },
  part4: { ...DEFAULT_PART4_DATA },
  recentInsights: [],
  versionHistory: [],
};

const STORAGE_KEY = "dream-planner-data";

// ── Store class ──
class PlannerStore {
  private data: PlannerData;
  private listeners = new Set<() => void>();
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private dbSaveTimeout: ReturnType<typeof setTimeout> | null = null;
  private _isAuthenticated = false;

  constructor() {
    this.data = DEFAULT_DATA;
  }

  get isAuthenticated() {
    return this._isAuthenticated;
  }

  hydrate() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PlannerData>;
        this.data = {
          ...DEFAULT_DATA,
          ...parsed,
          part2: { ...DEFAULT_PART2_DATA, ...(parsed.part2 || {}) },
          part3: { ...DEFAULT_PART3_DATA, ...(parsed.part3 || {}) },
          part4: { ...DEFAULT_PART4_DATA, ...(parsed.part4 || {}) },
        };

        // Update streak
        const now = new Date();
        const lastVisit = this.data.lastVisitAt
          ? new Date(this.data.lastVisitAt)
          : null;

        if (lastVisit) {
          const diffDays = Math.floor(
            (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            this.data.streak += 1;
          } else if (diffDays > 1) {
            if (this.data.streak > this.data.maxStreak) {
              this.data.maxStreak = this.data.streak;
            }
            this.data.streak = 1;
          }
        } else {
          this.data.streak = 1;
        }
        if (this.data.streak > this.data.maxStreak) {
          this.data.maxStreak = this.data.streak;
        }

        this.data.lastVisitAt = now.toISOString();
        this.persist();
      }
    } catch {
      // ignore parse errors
    }
  }

  // Load data from server (database) — merges with localStorage
  async hydrateFromServer(): Promise<void> {
    try {
      const res = await fetch("/api/planner/load");
      if (!res.ok) return;

      const serverData = await res.json() as { data: PlannerData | null; authenticated: boolean };

      this._isAuthenticated = serverData.authenticated;

      if (serverData.data) {
        // Server data takes priority over localStorage
        this.data = {
          ...DEFAULT_DATA,
          ...serverData.data,
          part2: { ...DEFAULT_PART2_DATA, ...(serverData.data.part2 || {}) },
          part3: { ...DEFAULT_PART3_DATA, ...(serverData.data.part3 || {}) },
          part4: { ...DEFAULT_PART4_DATA, ...(serverData.data.part4 || {}) },
        };

        // Update streak
        const now = new Date();
        const lastVisit = this.data.lastVisitAt
          ? new Date(this.data.lastVisitAt)
          : null;
        if (lastVisit) {
          const diffDays = Math.floor(
            (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            this.data.streak += 1;
          } else if (diffDays > 1) {
            if (this.data.streak > this.data.maxStreak) {
              this.data.maxStreak = this.data.streak;
            }
            this.data.streak = 1;
          }
        } else if (!this.data.startedAt) {
          this.data.streak = 1;
        }
        if (this.data.streak > this.data.maxStreak) {
          this.data.maxStreak = this.data.streak;
        }
        this.data.lastVisitAt = now.toISOString();

        // Sync to localStorage as well
        this.persist();
        this.listeners.forEach((l) => l());
      }
    } catch {
      // Server unavailable — continue with localStorage data
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // storage full etc
    }
  }

  private debouncedPersist() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.persist(), 2000);
  }

  private debouncedDbSync() {
    if (!this._isAuthenticated) return;
    if (this.dbSaveTimeout) clearTimeout(this.dbSaveTimeout);
    this.dbSaveTimeout = setTimeout(() => {
      fetch("/api/planner/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.data),
      }).catch(() => {
        // Silently fail — localStorage is the fallback
      });
    }, 5000); // 5s debounce for DB saves (less frequent than localStorage)
  }

  private emit() {
    this.listeners.forEach((l) => l());
    this.debouncedPersist();
    this.debouncedDbSync();
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): PlannerData => this.data;

  // ── Mutators ──
  update(partial: Partial<PlannerData>) {
    this.data = { ...this.data, ...partial };
    this.emit();
  }

  setOnboarded(dreamStatement: string, userName: string) {
    this.data = {
      ...this.data,
      onboarded: true,
      dreamStatement,
      userName,
      startedAt: new Date().toISOString(),
      lastVisitAt: new Date().toISOString(),
      streak: 1,
    };
    this.emit();
  }

  setSkills(skills: SkillItem[]) {
    this.data = { ...this.data, skills };
    this.emit();
  }

  setResources(resources: ResourceItem[]) {
    this.data = { ...this.data, resources };
    this.emit();
  }

  setTimeBlocks(timeBlocks: TimeBlock[]) {
    this.data = { ...this.data, timeBlocks };
    this.emit();
  }

  setExpenses(expenses: ExpenseItem[]) {
    this.data = { ...this.data, expenses };
    this.emit();
  }

  setCurrentState(currentState: CurrentStateCard[]) {
    this.data = { ...this.data, currentState };
    this.emit();
  }

  setReflectionAnswers(reflectionAnswers: string[]) {
    this.data = { ...this.data, reflectionAnswers };
    this.emit();
  }

  setCurrentActivity(currentActivity: number) {
    this.data = { ...this.data, currentActivity };
    this.emit();
  }

  markActivityComplete(id: number, activityLabel?: string) {
    if (!this.data.completedActivities.includes(id)) {
      this.data = {
        ...this.data,
        completedActivities: [...this.data.completedActivities, id],
      };
      this.createSnapshot(activityLabel ? `Completed: ${activityLabel}` : `Completed Activity ${id}`);
      this.emit();
    }
  }

  // ── PART 2 ──
  setPart2Data(partial: Partial<Part2Data>) {
    this.data = {
      ...this.data,
      part2: { ...this.data.part2, ...partial },
    };
    this.emit();
  }

  // ── PART 3 ──
  setPart3Data(partial: Partial<Part3Data>) {
    this.data = {
      ...this.data,
      part3: { ...this.data.part3, ...partial },
    };
    this.emit();
  }

  // ── PART 4 ──
  setPart4Data(partial: Partial<Part4Data>) {
    this.data = {
      ...this.data,
      part4: { ...this.data.part4, ...partial },
    };
    this.emit();
  }

  addInsight(insight: CoachInsight) {
    const insights = [insight, ...this.data.recentInsights].slice(0, 10);
    this.data = { ...this.data, recentInsights: insights };
    this.emit();
  }

  // ── Version History ──
  createSnapshot(label: string) {
    const d = this.data;
    const snapshot: VersionSnapshot = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      label,
      metrics: {
        skillCount: d.skills.length,
        resourceAvg: d.resources.reduce((s, r) => s + r.score, 0) / Math.max(d.resources.length, 1),
        productiveHours: d.timeBlocks.filter((t) => t.type === "productive").reduce((s, t) => s + t.duration, 0),
        consumptionHours: d.timeBlocks.filter((t) => t.type === "consumption").reduce((s, t) => s + t.duration, 0),
        totalExpenses: d.expenses.reduce((s, e) => s + e.amount, 0),
        lowSatExpenses: d.expenses.filter((e) => e.satisfaction === "low").reduce((s, e) => s + e.amount, 0),
        completedActivities:
          d.completedActivities.length +
          d.part2.completedActivities.length +
          d.part3.completedActivities.length +
          d.part4.completedActivities.length,
        dreamStatement: d.dreamStatement,
        streak: d.streak,
        mindMapNodes: d.part2.mindMapNodes.length,
        failureEntries: d.part2.failureEntries.length,
        strengthsCount: d.part2.strengths.filter(Boolean).length,
        whyStatement: d.part2.whyWhatBridge.why,
        selectedIdea: d.part2.whyWhatBridge.selectedIndex >= 0 ? d.part2.whyWhatBridge.ideas[d.part2.whyWhatBridge.selectedIndex] || "" : "",
        finalProposal: d.part3.oneLineProposal.finalProposal,
        hypothesesTested: d.part3.hypotheses.filter((h) => h.status !== "pending").length,
        hypothesesSucceeded: d.part3.hypotheses.filter((h) => h.status === "success").length,
        mvpProgress: d.part3.mvpPlan.steps.length > 0 ? Math.round((d.part3.mvpPlan.steps.filter((s) => s.done).length / d.part3.mvpPlan.steps.length) * 100) : 0,
        valueLadderFilled: d.part3.valueLadder.filter((v) => v.productName.trim()).length,
        fanCandidates: d.part4.fanCandidates.length,
        fansConverted: d.part4.fanCandidates.filter((f) => f.stage === "fan").length,
        dream5Members: d.part4.dream5Network.members.length,
        rejectionsCompleted: d.part4.rejectionChallenges.filter((r) => r.completed).length,
        sustainabilityScore: (() => {
          const qs = d.part4.sustainabilityChecklist.questions;
          const yesCount = qs.filter((q) => q.answer === "yes").length;
          return qs.length > 0 ? Math.round((yesCount / qs.length) * 100) : 0;
        })(),
      },
    };
    const history = [snapshot, ...this.data.versionHistory].slice(0, 30);
    this.data = { ...this.data, versionHistory: history };
    this.emit();
  }

  deleteSnapshot(id: string) {
    this.data = {
      ...this.data,
      versionHistory: this.data.versionHistory.filter((s) => s.id !== id),
    };
    this.emit();
  }

  reset() {
    this.data = { ...DEFAULT_DATA };
    this.persist();
    this.emit();
  }
}

// ── Singleton ──
let storeInstance: PlannerStore | null = null;

function getStore(): PlannerStore {
  if (!storeInstance) {
    storeInstance = new PlannerStore();
  }
  return storeInstance;
}

// ── Hook ──
export function usePlannerStore() {
  const store = getStore();
  const data = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => DEFAULT_DATA
  );
  return { data, store };
}

export { getStore, DEFAULT_DATA };
