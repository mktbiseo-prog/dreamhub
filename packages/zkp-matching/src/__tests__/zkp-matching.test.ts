// ---------------------------------------------------------------------------
// ZKP Matching — Unit Tests
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §16
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  quantizeVector,
  dequantizeVector,
  maxQuantizationError,
  verifySimilarity,
  cosineSimilarity,
  dotProduct,
  squaredNorm,
  createCommitment,
  verifyCommitment,
  BlindMatchProtocol,
  PrivacyLevel,
  PRIVACY_LEVEL_INFO,
  resolvePrivacyLevel,
  requiresZKP,
} from "../index";

// ═══════════════════════════════════════════════════════════════════════════
// 1. Vector Quantization
// ═══════════════════════════════════════════════════════════════════════════

describe("Quantization", () => {
  it("should quantize float vector to integers", () => {
    const result = quantizeVector([0.5, -0.3, 0.123], 1000);
    expect(result).toEqual([500, -300, 123]);
  });

  it("should dequantize back to floats", () => {
    const result = dequantizeVector([500, -300, 123], 1000);
    expect(result).toEqual([0.5, -0.3, 0.123]);
  });

  it("should have roundtrip error within tolerance", () => {
    const original = [0.12345, 0.67891, -0.54321, 0.99999];
    const precision = 1000;
    const quantized = quantizeVector(original, precision);
    const restored = dequantizeVector(quantized, precision);

    const maxError = maxQuantizationError(precision);
    for (let i = 0; i < original.length; i++) {
      expect(Math.abs(original[i] - restored[i])).toBeLessThanOrEqual(maxError);
    }
  });

  it("should preserve exact values that are multiples of 1/precision", () => {
    const original = [0.001, 0.5, 1.0, -1.0];
    const quantized = quantizeVector(original, 1000);
    const restored = dequantizeVector(quantized, 1000);
    expect(restored).toEqual(original);
  });

  it("should handle zero vector", () => {
    expect(quantizeVector([0, 0, 0])).toEqual([0, 0, 0]);
    expect(dequantizeVector([0, 0, 0])).toEqual([0, 0, 0]);
  });

  it("should handle different precision values", () => {
    const original = [0.7];
    expect(quantizeVector(original, 10)).toEqual([7]);
    expect(quantizeVector(original, 100)).toEqual([70]);
    expect(quantizeVector(original, 10000)).toEqual([7000]);
  });

  it("should report correct max quantization error", () => {
    expect(maxQuantizationError(1000)).toBe(0.0005);
    expect(maxQuantizationError(100)).toBe(0.005);
    expect(maxQuantizationError(10)).toBe(0.05);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Cosine Similarity Verification
// ═══════════════════════════════════════════════════════════════════════════

describe("Similarity Primitives", () => {
  it("should compute dot product", () => {
    expect(dotProduct([1, 2, 3], [4, 5, 6])).toBe(32); // 4+10+18
  });

  it("should compute squared norm", () => {
    expect(squaredNorm([3, 4])).toBe(25); // 9+16
  });

  it("should compute cosine similarity", () => {
    // Identical vectors → similarity = 1
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1.0, 10);

    // Orthogonal → similarity = 0
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 10);

    // Opposite → similarity = -1
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1.0, 10);
  });

  it("should return 0 for zero vector", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});

describe("verifySimilarity", () => {
  it("should return true for identical vectors (similarity = 1.0)", () => {
    const result = verifySimilarity([1, 2, 3], [1, 2, 3], 0.9);
    expect(result.isAboveThreshold).toBe(true);
    expect(result.actualSimilarity).toBeCloseTo(1.0, 5);
  });

  it("should return true for similar vectors above threshold", () => {
    const a = [0.8, 0.6, 0.1];
    const b = [0.7, 0.7, 0.1];
    const result = verifySimilarity(a, b, 0.9);
    expect(result.isAboveThreshold).toBe(true);
    expect(result.actualSimilarity).toBeGreaterThan(0.9);
  });

  it("should return false for orthogonal vectors", () => {
    const result = verifySimilarity([1, 0], [0, 1], 0.5);
    expect(result.isAboveThreshold).toBe(false);
    expect(result.actualSimilarity).toBeCloseTo(0, 5);
  });

  it("should return false for dissimilar vectors below threshold", () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    const result = verifySimilarity(a, b, 0.5);
    expect(result.isAboveThreshold).toBe(false);
  });

  it("should return false for opposite vectors", () => {
    const result = verifySimilarity([1, 0], [-1, 0], 0.1);
    expect(result.isAboveThreshold).toBe(false);
    expect(result.actualSimilarity).toBeCloseTo(-1.0, 5);
  });

  it("should work with quantized integer vectors", () => {
    // Quantized at precision=1000
    const a = quantizeVector([0.8, 0.6, 0.1], 1000);
    const b = quantizeVector([0.7, 0.7, 0.1], 1000);
    // Threshold stays as float (0–1): the formula dot² ≥ τ² × normA × normB
    // is scale-invariant — scaling vectors by P multiplies both sides by P⁴.
    const result = verifySimilarity(a, b, 0.9);
    expect(result.isAboveThreshold).toBe(true);
  });

  it("should include dot product and norms in result", () => {
    const result = verifySimilarity([3, 4], [3, 4], 0.5);
    expect(result.dotProduct).toBe(25);
    expect(result.normASquared).toBe(25);
    expect(result.normBSquared).toBe(25);
  });

  it("should throw on dimension mismatch", () => {
    expect(() => verifySimilarity([1, 2], [1, 2, 3], 0.5)).toThrow(
      "dimension mismatch",
    );
  });

  it("should handle threshold of exactly 0", () => {
    // Any non-negative similarity is above threshold 0
    const result = verifySimilarity([1, 0], [1, 1], 0);
    expect(result.isAboveThreshold).toBe(true);
  });

  it("should handle threshold of exactly 1", () => {
    // Only identical direction passes threshold 1
    const same = verifySimilarity([1, 2, 3], [2, 4, 6], 1.0);
    expect(same.isAboveThreshold).toBe(true); // parallel vectors

    const diff = verifySimilarity([1, 0], [1, 1], 1.0);
    expect(diff.isAboveThreshold).toBe(false); // not perfectly aligned
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Commitment
// ═══════════════════════════════════════════════════════════════════════════

describe("Commitment", () => {
  it("should create a commitment with hash and salt", () => {
    const vector = [100, 200, 300];
    const commitment = createCommitment(vector);
    expect(commitment.hash).toHaveLength(64); // SHA-256 hex
    expect(commitment.salt).toHaveLength(64); // 32 bytes hex
  });

  it("should verify a valid commitment", () => {
    const vector = [100, 200, 300];
    const commitment = createCommitment(vector);
    const valid = verifyCommitment(vector, commitment.hash, commitment.salt);
    expect(valid).toBe(true);
  });

  it("should reject a different vector", () => {
    const vector = [100, 200, 300];
    const commitment = createCommitment(vector);
    const spoofed = [100, 200, 301]; // changed last element
    const valid = verifyCommitment(spoofed, commitment.hash, commitment.salt);
    expect(valid).toBe(false);
  });

  it("should reject a wrong salt", () => {
    const vector = [100, 200, 300];
    const commitment = createCommitment(vector);
    const valid = verifyCommitment(
      vector,
      commitment.hash,
      "0000000000000000000000000000000000000000000000000000000000000000",
    );
    expect(valid).toBe(false);
  });

  it("should produce different hashes for same vector with different salts", () => {
    const vector = [100, 200, 300];
    const c1 = createCommitment(vector);
    const c2 = createCommitment(vector);
    // Different salts → different hashes (overwhelmingly likely)
    expect(c1.hash).not.toBe(c2.hash);
    expect(c1.salt).not.toBe(c2.salt);
  });

  it("should produce different hashes for different vectors", () => {
    const c1 = createCommitment([1, 2, 3]);
    const c2 = createCommitment([4, 5, 6]);
    expect(c1.hash).not.toBe(c2.hash);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Blind Match Protocol
// ═══════════════════════════════════════════════════════════════════════════

describe("BlindMatchProtocol", () => {
  const protocol = new BlindMatchProtocol(1000);

  describe("initiateMatch", () => {
    it("should create a commitment and public data", () => {
      const initiation = protocol.initiateMatch([0.8, 0.6, 0.1]);
      expect(initiation.commitment.hash).toHaveLength(64);
      expect(initiation.commitment.salt).toHaveLength(64);
      expect(initiation.publicData.privacyLevel).toBe(
        PrivacyLevel.LEVEL_3_BLIND,
      );
      expect(initiation.publicData.vectorDimension).toBe(3);
    });

    it("should include categories when provided", () => {
      const initiation = protocol.initiateMatch(
        [0.5, 0.5],
        ["tech", "art"],
      );
      expect(initiation.publicData.categories).toEqual(["tech", "art"]);
    });
  });

  describe("generateProof", () => {
    it("should generate a valid proof for matching vectors", () => {
      const privateVec = [0.8, 0.6, 0.1];
      const publicVec = [0.7, 0.7, 0.1];
      const initiation = protocol.initiateMatch(privateVec);

      const { proof, publicInputs } = protocol.generateProof(
        privateVec,
        publicVec,
        0.9,
        initiation.commitment,
      );

      expect(proof.protocol).toBe("simulated_groth16");
      expect(proof.similarityCheckPassed).toBe(true);
      expect(proof.proofId).toHaveLength(32);
      expect(publicInputs.commitmentHash).toBe(initiation.commitment.hash);
    });

    it("should generate proof with similarityCheckPassed=false for dissimilar vectors", () => {
      const privateVec = [1, 0, 0];
      const publicVec = [0, 1, 0];
      const initiation = protocol.initiateMatch(privateVec);

      const { proof } = protocol.generateProof(
        privateVec,
        publicVec,
        0.9,
        initiation.commitment,
      );

      expect(proof.similarityCheckPassed).toBe(false);
    });

    it("should reject if private vector doesn't match commitment", () => {
      const realVec = [0.8, 0.6, 0.1];
      const fakeVec = [0.1, 0.1, 0.1];
      const initiation = protocol.initiateMatch(realVec);

      expect(() => {
        protocol.generateProof(
          fakeVec,        // trying to use a different vector
          [0.7, 0.7, 0.1],
          0.9,
          initiation.commitment, // but commitment was for realVec
        );
      }).toThrow("Commitment verification failed");
    });
  });

  describe("verifyProof", () => {
    it("should verify a valid proof", () => {
      const privateVec = [0.8, 0.6, 0.1];
      const publicVec = [0.7, 0.7, 0.1];
      const initiation = protocol.initiateMatch(privateVec);

      const { proof, publicInputs } = protocol.generateProof(
        privateVec,
        publicVec,
        0.9,
        initiation.commitment,
      );

      const result = protocol.verifyProof(
        proof,
        initiation.commitment,
        publicInputs,
      );

      expect(result.isValid).toBe(true);
      expect(result.matchResult).toBe("ABOVE_THRESHOLD");
    });

    it("should return BELOW_THRESHOLD for non-matching proof", () => {
      const privateVec = [1, 0, 0];
      const publicVec = [0, 1, 0];
      const initiation = protocol.initiateMatch(privateVec);

      const { proof, publicInputs } = protocol.generateProof(
        privateVec,
        publicVec,
        0.9,
        initiation.commitment,
      );

      const result = protocol.verifyProof(
        proof,
        initiation.commitment,
        publicInputs,
      );

      expect(result.isValid).toBe(true);
      expect(result.matchResult).toBe("BELOW_THRESHOLD");
    });

    it("should reject proof with wrong commitment", () => {
      const privateVec = [0.8, 0.6, 0.1];
      const publicVec = [0.7, 0.7, 0.1];
      const initiation = protocol.initiateMatch(privateVec);

      const { proof, publicInputs } = protocol.generateProof(
        privateVec,
        publicVec,
        0.9,
        initiation.commitment,
      );

      // Create a different commitment
      const fakeCommitment = createCommitment([999, 999, 999]);

      const result = protocol.verifyProof(
        proof,
        fakeCommitment,        // wrong commitment
        publicInputs,
      );

      expect(result.isValid).toBe(false);
    });
  });

  describe("executeBlindMatch", () => {
    it("should match similar vectors (end-to-end)", () => {
      const userA = [0.8, 0.6, 0.1, 0.3];
      const userB = [0.75, 0.65, 0.1, 0.25];
      const threshold = 0.95;

      const result = protocol.executeBlindMatch(userA, userB, threshold);

      expect(result.matched).toBe(true);
      expect(result.similarity).toBeGreaterThan(threshold);
      expect(result.proof.protocol).toBe("simulated_groth16");
      expect(result.commitment.hash).toHaveLength(64);
    });

    it("should not match dissimilar vectors (end-to-end)", () => {
      const userA = [1, 0, 0, 0];
      const userB = [0, 0, 0, 1];
      const threshold = 0.5;

      const result = protocol.executeBlindMatch(userA, userB, threshold);

      expect(result.matched).toBe(false);
      expect(result.similarity).toBeLessThan(threshold);
    });

    it("should match at exact threshold boundary", () => {
      // Two vectors with known similarity
      const a = [1, 0];
      const b = [1, 1]; // cosine = 1/sqrt(2) ≈ 0.7071
      const sim = cosineSimilarity(a, b);

      const result = protocol.executeBlindMatch(a, b, 0.7);
      expect(result.matched).toBe(true);
      expect(result.similarity).toBeCloseTo(sim, 3);
    });

    it("should preserve privacy — proof does not contain private vector", () => {
      const userA = [0.8, 0.6, 0.1];
      const userB = [0.7, 0.7, 0.1];

      const result = protocol.executeBlindMatch(userA, userB, 0.5);

      // The proof data should not contain the private vector values
      const proofStr = JSON.stringify(result.proof);
      expect(proofStr).not.toContain("0.8");
      expect(proofStr).not.toContain("0.6");
      // Only the commitment hash is in the proof
      expect(result.proof.privateInputHash).toBe(result.commitment.hash);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Privacy Levels
// ═══════════════════════════════════════════════════════════════════════════

describe("Privacy Levels", () => {
  it("should have info for all three levels", () => {
    expect(PRIVACY_LEVEL_INFO[PrivacyLevel.LEVEL_1_PUBLIC]).toBeDefined();
    expect(PRIVACY_LEVEL_INFO[PrivacyLevel.LEVEL_2_PARTIAL]).toBeDefined();
    expect(PRIVACY_LEVEL_INFO[PrivacyLevel.LEVEL_3_BLIND]).toBeDefined();
  });

  it("should only require ZKP for LEVEL_3_BLIND", () => {
    expect(requiresZKP(PrivacyLevel.LEVEL_1_PUBLIC)).toBe(false);
    expect(requiresZKP(PrivacyLevel.LEVEL_2_PARTIAL)).toBe(false);
    expect(requiresZKP(PrivacyLevel.LEVEL_3_BLIND)).toBe(true);
  });

  it("should resolve to the more restrictive level", () => {
    expect(
      resolvePrivacyLevel(PrivacyLevel.LEVEL_1_PUBLIC, PrivacyLevel.LEVEL_3_BLIND),
    ).toBe(PrivacyLevel.LEVEL_3_BLIND);

    expect(
      resolvePrivacyLevel(PrivacyLevel.LEVEL_2_PARTIAL, PrivacyLevel.LEVEL_1_PUBLIC),
    ).toBe(PrivacyLevel.LEVEL_2_PARTIAL);

    expect(
      resolvePrivacyLevel(PrivacyLevel.LEVEL_3_BLIND, PrivacyLevel.LEVEL_3_BLIND),
    ).toBe(PrivacyLevel.LEVEL_3_BLIND);
  });

  it("should resolve same levels to themselves", () => {
    expect(
      resolvePrivacyLevel(PrivacyLevel.LEVEL_1_PUBLIC, PrivacyLevel.LEVEL_1_PUBLIC),
    ).toBe(PrivacyLevel.LEVEL_1_PUBLIC);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Security: Spoofing & Tampering Resistance
// ═══════════════════════════════════════════════════════════════════════════

describe("Security — Spoofing Resistance", () => {
  const protocol = new BlindMatchProtocol(1000);

  it("should prevent commitment spoofing with a different vector", () => {
    // User A commits to vector X
    const realVector = [0.8, 0.6, 0.1];
    const initiation = protocol.initiateMatch(realVector);

    // Attacker tries to generate proof with vector Y
    // using victim's commitment
    const fakeVector = [0.99, 0.99, 0.99]; // high similarity to anything

    expect(() => {
      protocol.generateProof(
        fakeVector,
        [0.7, 0.7, 0.1],
        0.5,
        initiation.commitment,
      );
    }).toThrow("Commitment verification failed");
  });

  it("should prevent replaying a proof with a different commitment", () => {
    const vecA = [0.8, 0.6, 0.1];
    const vecB = [0.7, 0.7, 0.1];
    const initA = protocol.initiateMatch(vecA);

    const { proof, publicInputs } = protocol.generateProof(
      vecA,
      vecB,
      0.5,
      initA.commitment,
    );

    // Attacker creates a different commitment and tries to use A's proof
    const attackerVec = [0.1, 0.1, 0.1];
    const attackerInit = protocol.initiateMatch(attackerVec);

    const result = protocol.verifyProof(
      proof,
      attackerInit.commitment, // different commitment
      publicInputs,
    );

    expect(result.isValid).toBe(false);
  });

  it("should ensure same commitment verifies consistently", () => {
    const vector = [500, 600, 700];
    const commitment = createCommitment(vector);

    // Verify multiple times
    for (let i = 0; i < 5; i++) {
      expect(verifyCommitment(vector, commitment.hash, commitment.salt)).toBe(true);
    }
  });

  it("should detect single-element tampering in vector", () => {
    const original = [100, 200, 300, 400, 500];
    const commitment = createCommitment(original);

    // Tamper with each element
    for (let i = 0; i < original.length; i++) {
      const tampered = [...original];
      tampered[i] += 1;
      expect(verifyCommitment(tampered, commitment.hash, commitment.salt)).toBe(
        false,
      );
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. Integration: Quantization + Similarity + Commitment
// ═══════════════════════════════════════════════════════════════════════════

describe("Integration — Full ZKP Pipeline", () => {
  it("should produce consistent results through quantize → verify → commit pipeline", () => {
    const vecA = [0.85, 0.62, 0.15, 0.40];
    const vecB = [0.80, 0.65, 0.10, 0.35];
    const threshold = 0.95;

    // Step 1: Quantize
    const qA = quantizeVector(vecA, 1000);
    const qB = quantizeVector(vecB, 1000);

    // Step 2: Verify similarity on quantized vectors
    // Threshold stays as float — the check formula is scale-invariant.
    const simResult = verifySimilarity(qA, qB, threshold);

    // Step 3: Verify similarity on original floats
    const floatSim = cosineSimilarity(vecA, vecB);

    // Quantized check should agree with float check
    expect(simResult.isAboveThreshold).toBe(floatSim >= threshold);

    // Step 4: Commit to quantized vector
    const commitment = createCommitment(qA);
    expect(verifyCommitment(qA, commitment.hash, commitment.salt)).toBe(true);
  });

  it("should handle high-dimensional Dream DNA vectors", () => {
    // Simulate a 16-dimensional Dream DNA vector
    const vecA = Array.from({ length: 16 }, (_, i) => 0.5 + 0.03 * i);
    const vecB = Array.from({ length: 16 }, (_, i) => 0.5 + 0.025 * i);

    const protocol = new BlindMatchProtocol(1000);
    const result = protocol.executeBlindMatch(vecA, vecB, 0.99);

    // These very similar vectors should match at 0.99 threshold
    expect(result.similarity).toBeGreaterThan(0.99);
    expect(result.matched).toBe(true);
  });
});
