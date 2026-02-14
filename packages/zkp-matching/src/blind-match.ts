// ---------------------------------------------------------------------------
// Blind Match Protocol
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §16.3
//
// Full protocol flow:
//   1. Local vector generation (on-device)
//   2. Commitment: H(vec_a) published to immutable ledger
//   3. Challenge: download vec_b and threshold τ
//   4. Proving: generate proof π on-device via snarkjs
//   5. Verification: server verifies π without seeing vec_a
//
// This module implements the protocol with simulated proofs.
// Each simulation point is marked with TODO for snarkjs replacement.
// ---------------------------------------------------------------------------

import { randomBytes } from "crypto";
import { quantizeVector } from "./quantize";
import { verifySimilarity, cosineSimilarity } from "./similarity";
import { createCommitment, verifyCommitment } from "./commitment";
import { PrivacyLevel } from "./types";
import type {
  Commitment,
  SimulatedProof,
  PublicInputs,
  VerificationResult,
  MatchInitiation,
  BlindMatchResult,
} from "./types";

/**
 * Blind Match Protocol — orchestrates the full ZKP matching flow.
 *
 * In production, proof generation would happen on the user's device
 * using a compiled Circom circuit and snarkjs. This class simulates
 * that flow so the protocol logic can be tested end-to-end.
 */
export class BlindMatchProtocol {
  private readonly precision: number;

  constructor(precision: number = 1000) {
    this.precision = precision;
  }

  /**
   * Step 1+2: Initiate a match by quantizing the private vector
   * and creating a commitment.
   *
   * §16.3 Step 1: "사용자 A의 기기에서 드림 DNA 벡터 생성"
   * §16.3 Step 2: "vec(a)의 해시값 H(vec(a))를 게시하여 벡터를 고정"
   *
   * @param privateVector - User A's private Dream DNA vector (float)
   * @param categories - Optional category labels for LEVEL_2_PARTIAL
   * @returns Commitment and public data
   */
  initiateMatch(
    privateVector: number[],
    categories?: string[],
  ): MatchInitiation {
    const quantized = quantizeVector(privateVector, this.precision);
    const commitment = createCommitment(quantized);

    return {
      commitment,
      publicData: {
        privacyLevel: PrivacyLevel.LEVEL_3_BLIND,
        vectorDimension: privateVector.length,
        categories,
      },
    };
  }

  /**
   * Step 3+4: Generate a proof that the private vector's cosine similarity
   * with the public target vector meets the threshold.
   *
   * §16.3 Step 3: "사용자 B의 공개 벡터와 임계값 다운로드"
   * §16.3 Step 4: "snarkjs를 사용해 증명 π를 생성"
   *
   * TODO: Replace with actual snarkjs proof generation:
   *   const { proof, publicSignals } = await snarkjs.groth16.fullProve(
   *     { a: quantizedA, b: quantizedB, threshold: quantizedThreshold },
   *     "cosine_similarity.wasm",
   *     "cosine_similarity_final.zkey"
   *   );
   *
   * @param privateVector - User A's private vector (float)
   * @param publicTargetVector - User B's public vector (float)
   * @param threshold - Minimum cosine similarity (0–1)
   * @param commitment - Commitment created in initiateMatch
   * @returns Simulated proof and public inputs
   */
  generateProof(
    privateVector: number[],
    publicTargetVector: number[],
    threshold: number,
    commitment: Commitment,
  ): { proof: SimulatedProof; publicInputs: PublicInputs } {
    // Quantize both vectors for circuit-compatible integer arithmetic
    const quantizedA = quantizeVector(privateVector, this.precision);
    const quantizedB = quantizeVector(publicTargetVector, this.precision);

    // Verify commitment still matches (prevent vector swapping)
    const commitmentValid = verifyCommitment(
      quantizedA,
      commitment.hash,
      commitment.salt,
    );
    if (!commitmentValid) {
      throw new Error(
        "Commitment verification failed: private vector does not match " +
        "the committed vector. This could indicate vector tampering.",
      );
    }

    // Run the similarity check on quantized vectors.
    // The threshold stays as a float (0–1) because the formula
    // dot² ≥ τ² × normA × normB is scale-invariant:
    // scaling vectors by P multiplies both sides by P⁴, which cancels.
    const result = verifySimilarity(quantizedA, quantizedB, threshold);

    // Generate simulated proof
    // TODO: Replace with snarkjs.groth16.fullProve()
    const proof: SimulatedProof = {
      proofId: randomBytes(16).toString("hex"),
      protocol: "simulated_groth16",
      timestamp: new Date().toISOString(),
      privateInputHash: commitment.hash,
      similarityCheckPassed: result.isAboveThreshold,
      proofData: randomBytes(128).toString("hex"),
    };

    const publicInputs: PublicInputs = {
      commitmentHash: commitment.hash,
      publicVector: quantizedB,
      threshold,
      precision: this.precision,
    };

    return { proof, publicInputs };
  }

  /**
   * Step 5: Verify a proof submitted by the prover.
   *
   * §16.3 Step 5: "드림 플레이스 서버(Verifier)는 증명 π를 검증.
   * 통과 시 실제 데이터 열람 없이 매칭 성사 처리."
   *
   * TODO: Replace with actual snarkjs verification:
   *   const isValid = await snarkjs.groth16.verify(
   *     verificationKey,
   *     publicSignals,
   *     proof
   *   );
   *
   * @param proof - The proof to verify
   * @param commitment - The prover's commitment
   * @param publicInputs - Public inputs accompanying the proof
   * @returns Verification result
   */
  verifyProof(
    proof: SimulatedProof,
    commitment: Commitment,
    publicInputs: PublicInputs,
  ): VerificationResult {
    // Check 1: Proof references the correct commitment
    const commitmentMatches =
      proof.privateInputHash === commitment.hash &&
      proof.privateInputHash === publicInputs.commitmentHash;

    // Check 2: Proof is well-formed
    // TODO: Replace with snarkjs.groth16.verify(vkey, publicSignals, proof)
    const proofStructureValid =
      proof.protocol === "simulated_groth16" &&
      proof.proofId.length === 32 &&
      proof.proofData.length > 0;

    const isValid = commitmentMatches && proofStructureValid;

    return {
      isValid,
      matchResult: isValid && proof.similarityCheckPassed
        ? "ABOVE_THRESHOLD"
        : "BELOW_THRESHOLD",
    };
  }

  /**
   * Execute the full blind match protocol in one call.
   *
   * Combines initiateMatch → generateProof → verifyProof.
   *
   * @param userAPrivateVector - User A's private Dream DNA (float)
   * @param userBPublicVector - User B's public/challenge vector (float)
   * @param threshold - Minimum cosine similarity for a match (0–1)
   * @returns Complete blind match result
   */
  executeBlindMatch(
    userAPrivateVector: number[],
    userBPublicVector: number[],
    threshold: number,
  ): BlindMatchResult {
    // Step 1+2: Initiate and commit
    const initiation = this.initiateMatch(userAPrivateVector);

    // Step 3+4: Generate proof
    const { proof, publicInputs } = this.generateProof(
      userAPrivateVector,
      userBPublicVector,
      threshold,
      initiation.commitment,
    );

    // Step 5: Verify proof
    const verification = this.verifyProof(
      proof,
      initiation.commitment,
      publicInputs,
    );

    // Compute actual similarity for the result
    const similarity = cosineSimilarity(userAPrivateVector, userBPublicVector);

    return {
      matched: verification.isValid && verification.matchResult === "ABOVE_THRESHOLD",
      proof,
      commitment: initiation.commitment,
      similarity,
    };
  }
}
