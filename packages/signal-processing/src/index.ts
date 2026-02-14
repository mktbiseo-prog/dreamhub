// ---------------------------------------------------------------------------
// @dreamhub/signal-processing — Multi-Signal Fusion & Cluster Discovery
//
// Implements algorithms from:
//   - §3: Multi-Signal Fusion (Kalman filter, Dempster-Shafer evidence fusion)
//   - §11: Graph Cluster Discovery (HDBSCAN density-based clustering)
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md
// ---------------------------------------------------------------------------

// -- Kalman Filter (§3.6 Dynamic Fusion) ------------------------------------
export {
  KalmanFilter,
  type KalmanFilterOptions,
  type KalmanStep,
  type BatchFilterOptions,
} from "./kalman";

// -- Dempster-Shafer Theory (§3.5 Evidence Fusion) --------------------------
export {
  combine,
  combineMultiple,
  belief,
  plausibility,
  uncertainty,
  fuseTrustSignals,
  type MassFunction,
  type TrustSignal,
  type FusionResult,
} from "./dempster-shafer";

// -- HDBSCAN Clustering (§11 Dream Cluster Discovery) ----------------------
export {
  hdbscan,
  euclideanDistance,
  computeCoreDistances,
  type HdbscanOptions,
  type HdbscanResult,
} from "./hdbscan";
