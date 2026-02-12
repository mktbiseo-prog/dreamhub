"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import type {
  SkillItem,
  ResourceItem,
  TimeBlock,
  ExpenseItem,
  CurrentStateCard,
  ReflectionAnswer,
} from "@/types/planner";
import {
  RESOURCE_DEFAULTS,
  CURRENT_STATE_DEFAULTS,
  PART1_REFLECTION_QUESTIONS,
} from "@/types/planner";

// ── Types ──
export interface PlannerData {
  // Meta
  onboarded: boolean;
  dreamStatement: string;
  userName: string;
  startedAt: string | null;
  lastVisitAt: string | null;
  streak: number;

  // PART 1
  skills: SkillItem[];
  resources: ResourceItem[];
  timeBlocks: TimeBlock[];
  expenses: ExpenseItem[];
  currentState: CurrentStateCard[];
  reflectionAnswers: string[];
  completedActivities: number[];
  currentActivity: number;
}

const DEFAULT_DATA: PlannerData = {
  onboarded: false,
  dreamStatement: "",
  userName: "",
  startedAt: null,
  lastVisitAt: null,
  streak: 0,
  skills: [],
  resources: RESOURCE_DEFAULTS.map((r) => ({ ...r })),
  timeBlocks: [],
  expenses: [],
  currentState: CURRENT_STATE_DEFAULTS.map((c) => ({ ...c })),
  reflectionAnswers: PART1_REFLECTION_QUESTIONS.map(() => ""),
  completedActivities: [],
  currentActivity: 1,
};

const STORAGE_KEY = "dream-planner-data";

// ── Store class ──
class PlannerStore {
  private data: PlannerData;
  private listeners = new Set<() => void>();
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.data = DEFAULT_DATA;
  }

  hydrate() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PlannerData>;
        this.data = { ...DEFAULT_DATA, ...parsed };

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
            this.data.streak = 1;
          }
        } else {
          this.data.streak = 1;
        }

        this.data.lastVisitAt = now.toISOString();
        this.persist();
      }
    } catch {
      // ignore parse errors
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

  private emit() {
    this.listeners.forEach((l) => l());
    this.debouncedPersist();
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

export { getStore };
