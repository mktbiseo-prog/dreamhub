import { NextResponse } from "next/server";
import { ProjectStage } from "@dreamhub/shared-types";
import type { DreamDna } from "@dreamhub/shared-types";
import { computeMatchScore } from "@/lib/matching-engine";
import { applySuccessPattern } from "@/lib/team-performance";

/** Build a mock DreamDna with deterministic values seeded by userId */
function makeMockDna(userId: string): DreamDna {
  // Simple hash to produce different but deterministic vectors per user
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  const seed = Math.abs(hash % 100) / 100;

  return {
    identity: {
      visionEmbedding: [seed, 1 - seed, seed * 0.6],
      coreValues: ["innovation", "growth"],
      shadowTraits: [],
      emotion: { valence: 0.5 + seed * 0.3, arousal: 0.4 + seed * 0.2 },
    },
    capability: {
      hardSkills: [{ name: "engineering", proficiency: 0.7 + seed * 0.2 }],
      softSkills: [{ name: "communication", proficiency: 0.6 }],
      skillVector: [seed, 0.5, 1 - seed, seed * 0.8, 0.3],
    },
    execution: {
      gritScore: 0.4 + seed * 0.5,
      completionRate: 0.5 + seed * 0.3,
      salesPerformance: 0,
      mvpLaunched: seed > 0.5,
    },
    trust: {
      offlineReputation: 0.5 + seed * 0.3,
      doorbellResponseRate: 0.6 + seed * 0.3,
      deliveryCompliance: 0.7,
      compositeTrust: 0.5 + seed * 0.3,
    },
    updatedAt: new Date(),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string; targetId: string }> },
) {
  try {
    const { userId, targetId } = await params;

    if (userId === targetId) {
      return NextResponse.json(
        { error: "Cannot compute match score with self" },
        { status: 400 },
      );
    }

    const userA = makeMockDna(userId);
    const userB = makeMockDna(targetId);

    const matchResult = computeMatchScore({
      userA,
      userB,
      requiredSkills: [1, 1, 1, 0.5, 0],
      teamSkills: userA.capability.skillVector,
      stage: ProjectStage.BUILDING,
      psychFit: 0.65,
      dataPoints: 15,
    });

    const boosted = applySuccessPattern(
      matchResult.score,
      "IT_SERVICE",
      [
        { role: "visionary", tags: ["leadership"] },
        { role: "engineer", tags: ["TypeScript"] },
      ],
    );

    return NextResponse.json({
      userId,
      targetId,
      matchResult,
      boosted: {
        baseScore: boosted.baseScore,
        boostedScore: boosted.boostedScore,
        matchingPatternCount: boosted.matchingPatternCount,
        boostMultiplier: boosted.boostMultiplier,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
