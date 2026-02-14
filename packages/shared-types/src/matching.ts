// ---------------------------------------------------------------------------
// Matching Result Types
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §6, §7, §8
// ---------------------------------------------------------------------------

/** Result of a multi-signal matching computation between a user and a project/team */
export interface MatchResult {
  /** Overall geometric-mean match score (0 … 1) */
  score: number;
  /** Cosine similarity of vision embeddings (0 … 1) */
  visionAlignment: number;
  /** Gram-Schmidt orthogonality-based skill complementarity (0 … 1) */
  complementarity: number;
  /** Weighted composite trust index (0 … 1) */
  trustIndex: number;
  /** Psychological compatibility / personality fit (0 … 1) */
  psychFit: number;
}

/** A ranked match candidate returned from the matching engine */
export interface MatchCandidate {
  userId: string;
  projectId: string;
  result: MatchResult;
  /** ISO 8601 timestamp when the match was computed */
  matchedAt: string;
}
