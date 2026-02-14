// ---------------------------------------------------------------------------
// ZKP Matching — Types
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §16
// ---------------------------------------------------------------------------

// ── Privacy Levels ─────────────────────────────────────────────────────────

/** Privacy level for matching operations */
export enum PrivacyLevel {
  /** Full vector exposed — traditional matching (no privacy) */
  LEVEL_1_PUBLIC = "LEVEL_1_PUBLIC",
  /** Only category/domain exposed; detailed vector stays private */
  LEVEL_2_PARTIAL = "LEVEL_2_PARTIAL",
  /** Fully blind matching via ZKP — no data leaves the device */
  LEVEL_3_BLIND = "LEVEL_3_BLIND",
}

// ── Quantization ───────────────────────────────────────────────────────────

/** A quantized (fixed-point integer) vector for ZKP circuits */
export type QuantizedVector = number[];

// ── Similarity ─────────────────────────────────────────────────────────────

/** Result of a cosine similarity verification */
export interface SimilarityResult {
  /** Whether the similarity is at or above the threshold */
  isAboveThreshold: boolean;
  /** The actual cosine similarity value (-1 … 1) */
  actualSimilarity: number;
  /** The dot product a · b */
  dotProduct: number;
  /** Squared norm of vector A */
  normASquared: number;
  /** Squared norm of vector B */
  normBSquared: number;
}

// ── Commitment ─────────────────────────────────────────────────────────────

/** A cryptographic commitment to a vector */
export interface Commitment {
  /** SHA-256 hash hex string: H(salt || vector) */
  hash: string;
  /** Random salt used in the commitment */
  salt: string;
}

// ── ZKP Proof (simulated) ──────────────────────────────────────────────────

/**
 * Simulated ZKP proof object.
 *
 * TODO: Replace with actual snarkjs Groth16/Plonk proof structure:
 *   { pi_a: [string, string, string],
 *     pi_b: [[string, string], [string, string], [string, string]],
 *     pi_c: [string, string, string],
 *     protocol: "groth16" }
 */
export interface SimulatedProof {
  /** Proof identifier */
  proofId: string;
  /** Proof protocol (simulated) */
  protocol: "simulated_groth16";
  /** Timestamp of proof generation */
  timestamp: string;
  /** Hash of the prover's private input (commitment) */
  privateInputHash: string;
  /** Whether the similarity check passed during proof generation */
  similarityCheckPassed: boolean;
  /** Simulated proof data (placeholder for actual π) */
  proofData: string;
}

/** Public inputs that accompany a proof */
export interface PublicInputs {
  /** Commitment hash of user A's private vector */
  commitmentHash: string;
  /** User B's public vector (quantized) */
  publicVector: QuantizedVector;
  /** The similarity threshold (quantized) */
  threshold: number;
  /** Precision used for quantization */
  precision: number;
}

/** Result of proof verification */
export interface VerificationResult {
  /** Whether the proof is cryptographically valid */
  isValid: boolean;
  /** Match outcome */
  matchResult: "ABOVE_THRESHOLD" | "BELOW_THRESHOLD";
}

// ── Blind Match Protocol ───────────────────────────────────────────────────

/** Output of the initiation step */
export interface MatchInitiation {
  /** Commitment to the private vector */
  commitment: Commitment;
  /** Public data the initiator shares (privacy-level dependent) */
  publicData: {
    privacyLevel: PrivacyLevel;
    vectorDimension: number;
    /** Exposed only in LEVEL_2_PARTIAL: broad category labels */
    categories?: string[];
  };
}

/** Output of the full blind match execution */
export interface BlindMatchResult {
  /** Whether the match succeeded (similarity >= threshold) */
  matched: boolean;
  /** The generated proof */
  proof: SimulatedProof;
  /** Commitment to user A's vector */
  commitment: Commitment;
  /** The actual cosine similarity (available in simulation mode) */
  similarity: number;
}
