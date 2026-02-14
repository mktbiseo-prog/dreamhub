// ---------------------------------------------------------------------------
// Dream DNA — 4-Dimensional Vector Ontology
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §2
// ---------------------------------------------------------------------------

/** 1536-dimensional semantic embedding produced by text-embedding-3-small */
export type VisionEmbedding = number[];

// ── Identity (정체성) ──────────────────────────────────────────────────────
// Source: Dream Brain, Dialogue of Dreams
export interface IdentityVector {
  /** Semantic embedding of the user's vision (1536-dim) */
  visionEmbedding: VisionEmbedding;
  /** Core values discovered through Dialogue of Dreams */
  coreValues: string[];
  /** Shadow traits surfaced during the darkness experience */
  shadowTraits: string[];
  /** Emotion valence derived from voice-tone analysis (-1 … 1) */
  emotionValence: number;
  /** Emotion arousal derived from voice-tone analysis (0 … 1) */
  emotionArousal: number;
}

// ── Capability (역량) ──────────────────────────────────────────────────────
// Source: Dream Planner, Dream Place
export interface CapabilityVector {
  /** Hard skills with proficiency score (0 … 1) */
  hardSkills: Record<string, number>;
  /** Soft skills with proficiency score (0 … 1) */
  softSkills: Record<string, number>;
  /** Sparse skill vector for algorithmic processing */
  skillVector: number[];
}

// ── Execution (실행력) ─────────────────────────────────────────────────────
// Source: Dream Planner, Dream Store
export interface ExecutionVector {
  /** Grit score (0 … 1) */
  gritScore: number;
  /** Project completion rate (0 … 1) */
  completionRate: number;
  /** Sales performance metric (0 … 1) */
  salesPerformance: number;
  /** Whether the user has launched an MVP */
  mvpLaunched: boolean;
}

// ── Trust (신뢰도) ─────────────────────────────────────────────────────────
// Source: Dream Cafe & Doorbell, Dream Store
export interface TrustVector {
  /** Offline reputation score (0 … 1) */
  offlineReputation: number;
  /** Doorbell response rate (0 … 1) */
  doorbellResponseRate: number;
  /** Delivery compliance rate (0 … 1) */
  deliveryCompliance: number;
  /** Composite trust score — weighted aggregate (0 … 1) */
  compositeTrust: number;
}

// ── Dream DNA (aggregate) ──────────────────────────────────────────────────
export interface DreamDna {
  userId: string;
  timestamp: string; // ISO 8601
  identity: IdentityVector;
  capability: CapabilityVector;
  execution: ExecutionVector;
  trust: TrustVector;
}

// ── Project Lifecycle ──────────────────────────────────────────────────────
// Ref: §8.5 Dynamic Weight Adjustment System

export enum ProjectStage {
  /** Stage 1 — vision & personality alignment phase */
  IDEATION = "IDEATION",
  /** Stage 2 — building the MVP, technical skills dominate */
  BUILDING = "BUILDING",
  /** Stage 3 — scaling the product, trust & grit dominate */
  SCALING = "SCALING",
}

// ── Dynamic Weights ────────────────────────────────────────────────────────

export interface StageWeights {
  /** Vision alignment weight */
  vision: number;
  /** Skill complementarity weight */
  skill: number;
  /** Trust index weight */
  trust: number;
  /** Psychological fit weight */
  psych: number;
}

/**
 * Weight presets per project lifecycle stage.
 *
 * | Stage     | vision | skill | trust | psych |
 * |-----------|--------|-------|-------|-------|
 * | IDEATION  |  0.5   |  0.1  |  0.1  |  0.3  |
 * | BUILDING  |  0.2   |  0.5  |  0.2  |  0.1  |
 * | SCALING   |  0.1   |  0.3  |  0.5  |  0.1  |
 */
export const STAGE_WEIGHTS: Record<ProjectStage, StageWeights> = {
  [ProjectStage.IDEATION]: { vision: 0.5, skill: 0.1, trust: 0.1, psych: 0.3 },
  [ProjectStage.BUILDING]: { vision: 0.2, skill: 0.5, trust: 0.2, psych: 0.1 },
  [ProjectStage.SCALING]: { vision: 0.1, skill: 0.3, trust: 0.5, psych: 0.1 },
} as const;
