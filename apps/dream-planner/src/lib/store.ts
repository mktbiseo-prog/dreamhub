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

  markActivityComplete(id: number) {
    if (!this.data.completedActivities.includes(id)) {
      this.data = {
        ...this.data,
        completedActivities: [...this.data.completedActivities, id],
      };
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
