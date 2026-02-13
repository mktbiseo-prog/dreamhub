export type DreamIntent =
  | "lead"       // I have a dream seeking a team
  | "join"       // I want to join someone's dream
  | "partner"    // Looking for dream partners
  | "explore";   // Just exploring

export interface WorkStyle {
  ideation: number;   // 0-100 — Plant, Specialist
  execution: number;  // 0-100 — Implementer, Completer Finisher
  people: number;     // 0-100 — Coordinator, Teamworker, Resource Investigator
  thinking: number;   // 0-100 — Monitor Evaluator, Specialist
  action: number;     // 0-100 — Shaper, Implementer
}

export interface Preferences {
  remotePreference: "remote" | "local" | "hybrid";
  timezone: string;
  industryInterests: string[];
  techPreference: "technical" | "non-technical" | "both";
}

export interface DreamProfileFormData {
  dreamStatement: string;
  intent: DreamIntent | "";
  skillsOffered: string[];
  skillsNeeded: string[];
  workStyle: WorkStyle;
  location: {
    city: string;
    country: string;
  };
  preferences: Preferences;
  bio: string;
  avatarFile: File | null;
  avatarPreview: string;
}

export const INITIAL_FORM_DATA: DreamProfileFormData = {
  dreamStatement: "",
  intent: "",
  skillsOffered: [],
  skillsNeeded: [],
  workStyle: {
    ideation: 50,
    execution: 50,
    people: 50,
    thinking: 50,
    action: 50,
  },
  location: {
    city: "",
    country: "",
  },
  preferences: {
    remotePreference: "hybrid",
    timezone: "",
    industryInterests: [],
    techPreference: "both",
  },
  bio: "",
  avatarFile: null,
  avatarPreview: "",
};

export const TOTAL_STEPS = 9;
