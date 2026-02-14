// ---------------------------------------------------------------------------
// ZKP Matching — Public API
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §16
// ---------------------------------------------------------------------------

export {
  PrivacyLevel,
  type QuantizedVector,
  type SimilarityResult,
  type Commitment,
  type SimulatedProof,
  type PublicInputs,
  type VerificationResult,
  type MatchInitiation,
  type BlindMatchResult,
} from "./types";

export {
  quantizeVector,
  dequantizeVector,
  maxQuantizationError,
} from "./quantize";

export {
  verifySimilarity,
  cosineSimilarity,
  dotProduct,
  squaredNorm,
} from "./similarity";

export {
  createCommitment,
  verifyCommitment,
} from "./commitment";

export { BlindMatchProtocol } from "./blind-match";

export {
  PRIVACY_LEVEL_INFO,
  resolvePrivacyLevel,
  requiresZKP,
} from "./privacy-level";
