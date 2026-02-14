// ---------------------------------------------------------------------------
// Cross-Domain Mapping — EMCDR Framework
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §5.5
//
// Maps user profiles from one service's embedding space to another using
// a learned linear transformation:
//
//   û^target = W × u^source
//
// The mapping matrix W is learned from "overlap users" who are active
// in both services:
//
//   min_W Σ_{u ∈ overlap} ||W × u^source − u^target||² + λ||W||²
// ---------------------------------------------------------------------------

import type { ServiceId, ServiceMapping } from "./types";
import { ALL_SERVICES } from "./types";

/** A user's embedding in a specific service */
export interface ServiceEmbedding {
  userId: string;
  service: ServiceId;
  embedding: number[];
}

/** An overlap user with embeddings in both source and target services */
export interface OverlapUser {
  userId: string;
  sourceEmbedding: number[];
  targetEmbedding: number[];
}

// ═══════════════════════════════════════════════════════════════════════════
// In-memory mapping store
// ═══════════════════════════════════════════════════════════════════════════

/** Learned mappings: "source→target" key → ServiceMapping */
const mappingStore = new Map<string, ServiceMapping>();

function mappingKey(source: ServiceId, target: ServiceId): string {
  return `${source}→${target}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Identity Matrix Initialization
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create an identity mapping matrix of given dimensions.
 * If targetDim ≠ sourceDim, uses a truncated or padded identity.
 */
function identityMatrix(targetDim: number, sourceDim: number): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < targetDim; i++) {
    const row = new Array<number>(sourceDim).fill(0);
    if (i < sourceDim) {
      row[i] = 1;
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Initialize an identity mapping between two services.
 * This is the starting point before any training data is available.
 */
export function initializeMapping(
  sourceService: ServiceId,
  targetService: ServiceId,
  dim: number,
): ServiceMapping {
  const mapping: ServiceMapping = {
    sourceService,
    targetService,
    weights: identityMatrix(dim, dim),
  };

  mappingStore.set(mappingKey(sourceService, targetService), mapping);
  return mapping;
}

/**
 * Initialize identity mappings for all service pairs.
 */
export function initializeAllMappings(dim: number): void {
  for (const source of ALL_SERVICES) {
    for (const target of ALL_SERVICES) {
      if (source !== target) {
        initializeMapping(source, target, dim);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Core: Map User Profile (§5.5 EMCDR)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Map a user's profile from one service to another.
 *
 * Formula (§5.5):
 *   û^target = W × u^source
 *
 * @param sourceService  The service where the user has a known profile
 * @param targetService  The service to map to
 * @param sourceProfile  The user's embedding in the source service
 * @returns The estimated embedding in the target service
 */
export function mapUserProfile(
  sourceService: ServiceId,
  targetService: ServiceId,
  sourceProfile: number[],
): number[] {
  if (sourceService === targetService) {
    return [...sourceProfile];
  }

  const key = mappingKey(sourceService, targetService);
  const mapping = mappingStore.get(key);

  if (!mapping) {
    // No mapping learned yet — return source as-is (identity assumption)
    return [...sourceProfile];
  }

  const W = mapping.weights;
  const targetDim = W.length;
  const result = new Array<number>(targetDim).fill(0);

  for (let i = 0; i < targetDim; i++) {
    const row = W[i];
    for (let j = 0; j < row.length; j++) {
      result[i] += row[j] * (sourceProfile[j] ?? 0);
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// Core: Update Mapping Weights (Ridge Regression)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Learn or update the mapping matrix W from overlap users.
 *
 * Minimizes (§5.5):
 *   min_W  Σ_{u ∈ overlap} ||W × u^source − u^target||² + λ||W||²
 *
 * Solved in closed form per target dimension (ridge regression):
 *   w_i = (X^T X + λnI)^{-1} X^T y_i
 *
 * @param sourceService  Source service ID
 * @param targetService  Target service ID
 * @param overlapUsers   Users with embeddings in both services
 * @param lambda         Regularization strength (default 0.01)
 * @returns The updated ServiceMapping
 */
export function updateMappingWeights(
  sourceService: ServiceId,
  targetService: ServiceId,
  overlapUsers: OverlapUser[],
  lambda: number = 0.01,
): ServiceMapping {
  if (overlapUsers.length === 0) {
    throw new Error("Need at least one overlap user to learn mapping");
  }

  const sourceDim = overlapUsers[0].sourceEmbedding.length;
  const targetDim = overlapUsers[0].targetEmbedding.length;
  const n = overlapUsers.length;

  // X^T X + λnI
  const XtX: number[][] = Array.from({ length: sourceDim }, () =>
    new Array<number>(sourceDim).fill(0),
  );
  for (const user of overlapUsers) {
    const x = user.sourceEmbedding;
    for (let i = 0; i < sourceDim; i++) {
      for (let j = 0; j < sourceDim; j++) {
        XtX[i][j] += x[i] * x[j];
      }
    }
  }
  for (let i = 0; i < sourceDim; i++) {
    XtX[i][i] += lambda * n;
  }

  // Invert X^T X + λnI
  const XtXinv = invertMatrix(XtX);

  // Per target dimension: w_i = XtXinv × (X^T y_i)
  const W: number[][] = [];
  for (let ti = 0; ti < targetDim; ti++) {
    const Xty = new Array<number>(sourceDim).fill(0);
    for (const user of overlapUsers) {
      const x = user.sourceEmbedding;
      const yi = user.targetEmbedding[ti] ?? 0;
      for (let j = 0; j < sourceDim; j++) {
        Xty[j] += x[j] * yi;
      }
    }

    const wi = new Array<number>(sourceDim).fill(0);
    for (let i = 0; i < sourceDim; i++) {
      for (let j = 0; j < sourceDim; j++) {
        wi[i] += XtXinv[i][j] * Xty[j];
      }
    }
    W.push(wi);
  }

  const mapping: ServiceMapping = {
    sourceService,
    targetService,
    weights: W,
  };

  mappingStore.set(mappingKey(sourceService, targetService), mapping);
  return mapping;
}

// ═══════════════════════════════════════════════════════════════════════════
// Gauss-Jordan matrix inversion (reused from cold-start)
// ═══════════════════════════════════════════════════════════════════════════

function invertMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const aug: number[][] = matrix.map((row, i) => {
    const identity = new Array<number>(n).fill(0);
    identity[i] = 1;
    return [...row, ...identity];
  });

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
        maxRow = row;
      }
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) {
      return Array.from({ length: n }, (_, i) => {
        const row = new Array<number>(n).fill(0);
        row[i] = 1;
        return row;
      });
    }

    for (let j = col; j < 2 * n; j++) {
      aug[col][j] /= pivot;
    }

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = col; j < 2 * n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  return aug.map((row) => row.slice(n));
}

// ═══════════════════════════════════════════════════════════════════════════
// Accessors
// ═══════════════════════════════════════════════════════════════════════════

export function getMapping(
  sourceService: ServiceId,
  targetService: ServiceId,
): ServiceMapping | undefined {
  return mappingStore.get(mappingKey(sourceService, targetService));
}

export function resetMappings(): void {
  mappingStore.clear();
}
