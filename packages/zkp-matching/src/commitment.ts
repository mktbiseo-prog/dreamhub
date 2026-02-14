// ---------------------------------------------------------------------------
// Vector Commitment (Hash-based)
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §16.3
//
// Step 2 of the Blind Match Protocol:
//   "사용자 A는 vec(a)의 해시값 H(vec(a))를 블록체인(또는 불변 원장)에
//    게시하여 벡터를 고정."
//
// We use SHA-256 with a random salt: H(salt || JSON(vector))
// This binds the user to a specific vector without revealing it.
//
// TODO: Replace with Poseidon hash for in-circuit commitment verification.
// Poseidon is ZKP-friendly (fewer constraints than SHA-256 in R1CS).
// ---------------------------------------------------------------------------

import { createHash, randomBytes } from "crypto";
import type { Commitment } from "./types";

/**
 * Create a cryptographic commitment to a vector.
 *
 * Uses SHA-256: H(salt || serialized_vector)
 *
 * The salt ensures that the same vector produces different commitments,
 * preventing rainbow-table attacks on known vector patterns.
 *
 * @param vector - The vector to commit to (float or quantized integers)
 * @returns Commitment hash and the salt used
 */
export function createCommitment(vector: number[]): Commitment {
  const salt = randomBytes(32).toString("hex");
  const hash = computeHash(vector, salt);
  return { hash, salt };
}

/**
 * Verify that a vector matches a previously created commitment.
 *
 * Recomputes H(salt || vector) and checks if it matches the stored hash.
 *
 * @param vector - The vector to verify
 * @param commitment - The commitment hash to check against
 * @param salt - The salt used during commitment creation
 * @returns true if the vector matches the commitment
 */
export function verifyCommitment(
  vector: number[],
  commitment: string,
  salt: string,
): boolean {
  const recomputed = computeHash(vector, salt);
  return recomputed === commitment;
}

/**
 * Compute SHA-256 hash of salt + serialized vector.
 *
 * TODO: Replace with Poseidon hash for ZKP circuit compatibility.
 * SHA-256 requires ~28,000 R1CS constraints per hash in Circom,
 * while Poseidon requires only ~240 constraints.
 */
function computeHash(vector: number[], salt: string): string {
  const serialized = JSON.stringify(vector);
  return createHash("sha256")
    .update(salt)
    .update(serialized)
    .digest("hex");
}
