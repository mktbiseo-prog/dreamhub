import { NextResponse } from "next/server";
import { z } from "zod";
import { ProjectStage } from "@dreamhub/shared-types";
import type { DreamDna } from "@dreamhub/shared-types";
import {
  runStableMatching,
  findBlockingPairs,
  type MatchProject,
  type MatchCandidate,
} from "@/lib/stable-matching";
import { publishMatchCreated } from "@/lib/event-handlers";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

const runMatchingSchema = z.object({
  candidates: z.array(z.object({
    candidateId: z.string(),
    psychFit: z.number().min(0).max(1).optional(),
  })).min(1),
  stage: z.nativeEnum(ProjectStage).optional(),
});

/** Generate a mock DreamDna for a given id */
function makeDna(id: string, skillBias: number): DreamDna {
  return {
    identity: {
      visionEmbedding: [0.5 + skillBias * 0.3, 0.5, 0.4],
      coreValues: ["innovation"],
      shadowTraits: [],
      emotion: { valence: 0.6, arousal: 0.5 },
    },
    capability: {
      hardSkills: [{ name: "skill-" + id, proficiency: 0.8 }],
      softSkills: [],
      skillVector: [skillBias, 1 - skillBias, 0.5, 0.3, skillBias * 0.7],
    },
    execution: {
      gritScore: 0.6,
      completionRate: 0.5,
      salesPerformance: 0,
      mvpLaunched: false,
    },
    trust: {
      offlineReputation: 0.6,
      doorbellResponseRate: 0.7,
      deliveryCompliance: 0.8,
      compositeTrust: 0.65,
    },
    updatedAt: new Date(),
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const i18n = i18nMiddleware(req);
  try {
    const auth = authMiddleware(req);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }

    const { projectId } = await params;
    const body = await req.json();

    const parsed = runMatchingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: i18n.t("error.validation"), details: parsed.error.flatten(), meta: i18n.meta },
        { status: 400 },
      );
    }

    const { candidates: candidateInputs, stage } = parsed.data;
    const projectStage = stage ?? ProjectStage.BUILDING;

    // Build project for stable matching
    const ownerDna = makeDna(projectId, 0.3);
    const project: MatchProject = {
      projectId,
      ownerDna,
      requiredSkills: [1, 1, 1, 0.5, 0],
      teamSkills: ownerDna.capability.skillVector,
      stage: projectStage,
      dataPoints: 20,
    };

    // Build candidates
    const matchCandidates: MatchCandidate[] = candidateInputs.map(
      (c, i) => ({
        candidateId: c.candidateId,
        dna: makeDna(c.candidateId, (i + 1) / (candidateInputs.length + 1)),
        psychFitByProject: {
          [projectId]: c.psychFit ?? 0.6,
        },
      }),
    );

    // Run Gale-Shapley stable matching
    const matches = runStableMatching([project], matchCandidates);
    const blockingPairs = findBlockingPairs([project], matchCandidates, matches);

    // Publish match_created events
    let eventsPublished = 0;
    for (const match of matches) {
      await publishMatchCreated(
        match.projectId,
        [match.candidateId],
        match.matchScore,
      );
      eventsPublished++;
    }

    return NextResponse.json({
      projectId,
      stage: projectStage,
      matches: matches.map((m) => ({
        candidateId: m.candidateId,
        matchScore: m.matchScore,
        breakdown: m.breakdown,
      })),
      blockingPairs,
      isStable: blockingPairs.length === 0,
      eventsPublished,
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
