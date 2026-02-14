// ---------------------------------------------------------------------------
// Dream Place — GraphQL Subgraph (Federation 2.0)
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §15.1
//
// Entity:  User @key(fields: "id"), Project @key(fields: "id")
// Types:   MatchRecommendation
// Queries: matchRecommendations, matchScore
// Mutation: runMatching
// ---------------------------------------------------------------------------

import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { computeMatchScore } from "@/lib/matching-engine";
import { runStableMatching, findBlockingPairs } from "@/lib/stable-matching";
import { getRecommendationStrategy } from "@/lib/cold-start";
import { publishMatchCreated } from "@/lib/event-handlers";
import type { DreamDna } from "@dreamhub/shared-types";
import { ProjectStage } from "@dreamhub/shared-types";

// ═══════════════════════════════════════════════════════════════════════════
// Schema
// ═══════════════════════════════════════════════════════════════════════════

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external"])

  type User @key(fields: "id") {
    id: ID!
    matchScore(targetId: ID!): Float!
    matchRecommendations(limit: Int = 10): [MatchRecommendation!]!
    trustIndex: Float!
    skillVector: [Float!]!
  }

  type MatchRecommendation {
    userId: ID!
    score: Float!
    visionAlignment: Float!
    skillComplementarity: Float!
    trustScore: Float!
    psychologicalFit: Float!
    explanation: String!
  }

  type Project @key(fields: "id") {
    id: ID!
    requiredSkillVector: [Float!]!
    gapVector: [Float!]!
    teamMembers: [User!]!
    lifecycleStage: LifecycleStage!
  }

  enum LifecycleStage {
    IDEATION
    BUILDING
    SCALING
  }

  type MatchingResult {
    projectId: ID!
    matches: [StableMatchEntry!]!
    blockingPairs: Int!
    isStable: Boolean!
  }

  type StableMatchEntry {
    candidateId: ID!
    score: Float!
  }

  type Query {
    matchRecommendations(userId: ID!, limit: Int = 10): [MatchRecommendation!]!
    matchScore(userA: ID!, userB: ID!): Float!
  }

  type Mutation {
    runMatching(projectId: ID!, candidateIds: [ID!]): MatchingResult!
  }
`;

// ═══════════════════════════════════════════════════════════════════════════
// Mock Data Helpers
// ═══════════════════════════════════════════════════════════════════════════

function mockDreamDna(userId: string): DreamDna {
  const seed = userId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const s1 = Math.sin(seed * 0.1) * 0.5 + 0.5;
  const s2 = Math.cos(seed * 0.2) * 0.5 + 0.5;
  return {
    userId,
    timestamp: new Date().toISOString(),
    identity: {
      visionEmbedding: [s1, s2, 0.3, 0.4, 0.5],
      coreValues: ["innovation", "growth"],
      shadowTraits: ["impatience"],
      emotionValence: 0.6,
      emotionArousal: 0.5,
    },
    capability: {
      hardSkills: { coding: 0.8, design: 0.6 },
      softSkills: { leadership: 0.7 },
      skillVector: [0.8, 0.6, 0.4, 0.7, 0.5],
    },
    execution: {
      gritScore: 0.6 + Math.sin(seed) * 0.2,
      completionRate: 0.7,
      salesPerformance: 0.5,
      mvpLaunched: false,
    },
    trust: {
      offlineReputation: 0.7,
      doorbellResponseRate: 0.8,
      deliveryCompliance: 0.9,
      compositeTrust: 0.5 + Math.cos(seed) * 0.3,
    },
  };
}

function generateRecommendations(userId: string, limit: number): Array<{
  userId: string; score: number; visionAlignment: number;
  skillComplementarity: number; trustScore: number;
  psychologicalFit: number; explanation: string;
}> {
  const candidates = ["user-a", "user-b", "user-c", "user-d", "user-e"]
    .filter((id) => id !== userId);

  const sourceDna = mockDreamDna(userId);
  const strategy = getRecommendationStrategy(15); // assume some interactions

  return candidates.slice(0, limit).map((candidateId) => {
    const targetDna = mockDreamDna(candidateId);
    const result = computeMatchScore({
      userA: sourceDna,
      userB: targetDna,
      requiredSkills: [0.9, 0.7, 0.5, 0.3, 0.8],
      teamSkills: [0.5, 0.4, 0.2, 0.1, 0.3],
      stage: ProjectStage.BUILDING,
      psychFit: 0.7,
      dataPoints: 15,
    });

    return {
      userId: candidateId,
      score: result.score,
      visionAlignment: result.visionAlignment,
      skillComplementarity: result.complementarity,
      trustScore: sourceDna.trust.compositeTrust,
      psychologicalFit: result.psychFit,
      explanation: `${strategy} strategy: ${(result.score * 100).toFixed(0)}% match based on vision alignment and skill complementarity.`,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Resolvers
// ═══════════════════════════════════════════════════════════════════════════

const resolvers = {
  Query: {
    matchRecommendations: (
      _: unknown,
      { userId, limit }: { userId: string; limit: number },
    ) => {
      return generateRecommendations(userId, limit);
    },
    matchScore: (_: unknown, { userA, userB }: { userA: string; userB: string }) => {
      const dnaA = mockDreamDna(userA);
      const dnaB = mockDreamDna(userB);
      const result = computeMatchScore({
        userA: dnaA,
        userB: dnaB,
        requiredSkills: [0.9, 0.7, 0.5, 0.3, 0.8],
        teamSkills: [0.5, 0.4, 0.2, 0.1, 0.3],
        stage: ProjectStage.BUILDING,
        psychFit: 0.7,
        dataPoints: 15,
      });
      return result.score;
    },
  },

  Mutation: {
    runMatching: async (
      _: unknown,
      { projectId, candidateIds }: { projectId: string; candidateIds?: string[] },
    ) => {
      const candIds = candidateIds ?? ["cand-1", "cand-2", "cand-3"];
      const ownerDna = mockDreamDna("owner-" + projectId);

      const projects: Array<{
        projectId: string; ownerDna: DreamDna;
        requiredSkills: number[]; teamSkills: number[];
        stage: ProjectStage; dataPoints: number;
      }> = [{
        projectId,
        ownerDna,
        requiredSkills: [0.9, 0.7, 0.5, 0.3, 0.8],
        teamSkills: [0.5, 0.4, 0.2, 0.1, 0.3],
        stage: ProjectStage.BUILDING,
        dataPoints: 10,
      }];

      const candidates = candIds.map((id) => ({
        candidateId: id,
        dna: mockDreamDna(id),
        psychFitByProject: { [projectId]: 0.5 + Math.abs(Math.sin(id.length)) * 0.4 },
      }));

      const matchResults = runStableMatching(projects, candidates);

      const blockingPairs = findBlockingPairs(projects, candidates, matchResults);

      // Publish events
      for (const match of matchResults) {
        await publishMatchCreated(projectId, [match.candidateId], match.matchScore);
      }

      return {
        projectId,
        matches: matchResults.map((m) => ({
          candidateId: m.candidateId,
          score: m.matchScore,
        })),
        blockingPairs: blockingPairs.length,
        isStable: blockingPairs.length === 0,
      };
    },
  },

  User: {
    __resolveReference: (ref: { id: string }) => ({ id: ref.id }),
    matchScore: (user: { id: string }, { targetId }: { targetId: string }) => {
      const dnaA = mockDreamDna(user.id);
      const dnaB = mockDreamDna(targetId);
      const result = computeMatchScore({
        userA: dnaA,
        userB: dnaB,
        requiredSkills: [0.9, 0.7, 0.5, 0.3, 0.8],
        teamSkills: [0.5, 0.4, 0.2, 0.1, 0.3],
        stage: ProjectStage.BUILDING,
        psychFit: 0.7,
        dataPoints: 15,
      });
      return result.score;
    },
    matchRecommendations: (user: { id: string }, { limit = 10 }: { limit?: number }) => {
      return generateRecommendations(user.id, limit);
    },
    trustIndex: (user: { id: string }) => {
      return mockDreamDna(user.id).trust.compositeTrust;
    },
    skillVector: () => [0.8, 0.6, 0.4, 0.7, 0.5],
  },

  Project: {
    __resolveReference: (ref: { id: string }) => ({ id: ref.id }),
    requiredSkillVector: () => [0.9, 0.7, 0.5, 0.3],
    gapVector: () => [0.4, 0.3, 0.5, 0.1],
    teamMembers: () => [{ id: "member-1" }, { id: "member-2" }],
    lifecycleStage: () => "BUILDING",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Apollo Server + Next.js App Router Handler
// ═══════════════════════════════════════════════════════════════════════════

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

const serverStartPromise = server.start();

async function handler(req: Request): Promise<Response> {
  await serverStartPromise;

  const body = await req.json();
  const result = await server.executeOperation({
    query: body.query,
    variables: body.variables,
    operationName: body.operationName,
  });

  if (result.body.kind === "single") {
    return new Response(JSON.stringify(result.body.singleResult), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ errors: [{ message: "Unexpected response" }] }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST = handler;
export const GET = handler;

