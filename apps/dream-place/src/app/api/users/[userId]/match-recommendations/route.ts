import { NextRequest, NextResponse } from "next/server";
import { ProjectStage } from "@dreamhub/shared-types";
import type { DreamDna } from "@dreamhub/shared-types";
import { computeMatchScore } from "@/lib/matching-engine";
import {
  getRecommendationStrategy,
  getInteractionCount,
  initializeFromContent,
  exploreBandit,
  type CategoryProfile,
  type ThoughtRecord,
  type BanditCandidate,
} from "@/lib/cold-start";
import { applySuccessPattern } from "@/lib/team-performance";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

/** Mock Dream DNA for generating recommendations */
function makeMockDna(seed: number): DreamDna {
  const base = (seed * 0.1) % 1;
  return {
    identity: {
      visionEmbedding: [base, 1 - base, base * 0.5],
      coreValues: ["innovation", "collaboration"],
      shadowTraits: [],
      emotion: { valence: 0.6 + base * 0.3, arousal: 0.5 },
    },
    capability: {
      hardSkills: [{ name: "TypeScript", proficiency: 0.8 }],
      softSkills: [{ name: "leadership", proficiency: 0.7 }],
      skillVector: [base, 1 - base, 0.5, base * 0.7, 0.3],
    },
    execution: {
      gritScore: 0.5 + base * 0.4,
      completionRate: 0.6,
      salesPerformance: 0,
      mvpLaunched: false,
    },
    trust: {
      offlineReputation: 0.5,
      doorbellResponseRate: 0.7,
      deliveryCompliance: 0.8,
      compositeTrust: 0.6 + base * 0.2,
    },
    updatedAt: new Date(),
  };
}

const MOCK_CANDIDATES = ["user-A", "user-B", "user-C", "user-D", "user-E",
  "user-F", "user-G", "user-H", "user-I", "user-J"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const i18n = i18nMiddleware(req);
  try {
    const auth = authMiddleware(req);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }

    const { userId } = await params;
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10),
      50,
    );

    const interactionCount = getInteractionCount(userId);
    const strategy = getRecommendationStrategy(interactionCount);

    const recommendations: Array<{
      candidateId: string;
      score: number;
      breakdown: Record<string, number>;
    }> = [];

    if (strategy === "CONTENT_INIT") {
      // §12.1: Initialize from content — use mock category profiles
      const mockThoughts: ThoughtRecord[] = [
        { thoughtId: "t1", category: "tech", embedding: [1, 0, 0] },
        { thoughtId: "t2", category: "design", embedding: [0, 1, 0] },
      ];
      const mockProfiles: CategoryProfile[] = [
        { category: "tech", meanEmbedding: [0.8, 0.1, 0.1], weight: 1.0 },
        { category: "design", meanEmbedding: [0.2, 0.7, 0.1], weight: 1.0 },
      ];
      const initVector = initializeFromContent(mockThoughts, mockProfiles);

      // Generate recommendations using match score against mock candidates
      const userDna = makeMockDna(1);
      userDna.identity.visionEmbedding = initVector.length > 0 ? initVector : [0.5, 0.5, 0.5];

      for (const candidateId of MOCK_CANDIDATES.slice(0, limit)) {
        const candidateDna = makeMockDna(MOCK_CANDIDATES.indexOf(candidateId) + 2);
        const result = computeMatchScore({
          userA: userDna,
          userB: candidateDna,
          requiredSkills: [1, 1, 1, 0, 0],
          teamSkills: userDna.capability.skillVector,
          stage: ProjectStage.IDEATION,
          psychFit: 0.6,
          dataPoints: Math.max(interactionCount, 1),
        });
        recommendations.push({
          candidateId,
          score: result.score,
          breakdown: {
            visionAlignment: result.visionAlignment,
            complementarity: result.complementarity,
            trustIndex: result.trustIndex,
            psychFit: result.psychFit,
          },
        });
      }
    } else if (strategy === "BANDIT_EXPLORE") {
      // §12.4: Thompson Sampling
      const candidates: BanditCandidate[] = MOCK_CANDIDATES.slice(0, limit).map(
        (id) => ({ candidateId: id }),
      );
      const banditResult = exploreBandit(userId, candidates);

      for (const sample of banditResult.allSamples) {
        recommendations.push({
          candidateId: sample.candidateId,
          score: sample.theta,
          breakdown: { sampledTheta: sample.theta },
        });
      }
    } else {
      // CROSS_DOMAIN_TRANSFER or COLLABORATIVE_FILTERING: mock scored list
      const userDna = makeMockDna(1);
      for (const candidateId of MOCK_CANDIDATES.slice(0, limit)) {
        const candidateDna = makeMockDna(MOCK_CANDIDATES.indexOf(candidateId) + 2);
        const result = computeMatchScore({
          userA: userDna,
          userB: candidateDna,
          requiredSkills: [1, 1, 1, 0, 0],
          teamSkills: userDna.capability.skillVector,
          stage: ProjectStage.BUILDING,
          psychFit: 0.7,
          dataPoints: interactionCount,
        });

        const boosted = applySuccessPattern(
          result.score,
          "IT_SERVICE",
          [{ role: "engineer", tags: ["TypeScript"] }],
        );

        recommendations.push({
          candidateId,
          score: boosted.boostedScore,
          breakdown: {
            visionAlignment: result.visionAlignment,
            complementarity: result.complementarity,
            trustIndex: result.trustIndex,
            psychFit: result.psychFit,
            boostMultiplier: boosted.boostMultiplier,
          },
        });
      }
    }

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      userId,
      strategy,
      interactionCount,
      recommendations: recommendations.slice(0, limit),
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
