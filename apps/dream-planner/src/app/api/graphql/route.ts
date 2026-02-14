// ---------------------------------------------------------------------------
// Dream Planner — GraphQL Subgraph (Federation 2.0)
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §15.1
//
// Entity:  User @key(fields: "id")
// Types:   PlannerProgress, PlannerProject
// Queries: gritScore, plannerProgress
// Mutation: updateStage
// ---------------------------------------------------------------------------

import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { calculateGritScore, toExecutionVector } from "@/lib/grit-score";
import { publishStageChanged } from "@/lib/event-handlers";

// ═══════════════════════════════════════════════════════════════════════════
// Schema
// ═══════════════════════════════════════════════════════════════════════════

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external"])

  type User @key(fields: "id") {
    id: ID!
    gritScore: Float!
    plannerProgress: PlannerProgress!
    projects: [PlannerProject!]!
  }

  type PlannerProgress {
    currentPart: Int!
    completionRate: Float!
    streakDays: Int!
    mvpLaunched: Boolean!
    part3Activities: Int!
    totalActivities: Int!
  }

  type PlannerProject {
    id: ID!
    title: String!
    stage: LifecycleStage!
    whyStatement: String!
    mvpDescription: String
    createdAt: String!
    updatedAt: String!
  }

  type ExecutionVector {
    completionRatio: Float!
    streakFactor: Float!
    mvpBonus: Float!
  }

  enum LifecycleStage {
    IDEATION
    BUILDING
    SCALING
  }

  type StageUpdateResult {
    projectId: ID!
    oldStage: LifecycleStage!
    newStage: LifecycleStage!
    eventPublished: Boolean!
  }

  type Query {
    gritScore(userId: ID!): Float!
    plannerProgress(userId: ID!): PlannerProgress!
  }

  type Mutation {
    updateStage(projectId: ID!, newStage: LifecycleStage!): StageUpdateResult!
  }
`;

// ═══════════════════════════════════════════════════════════════════════════
// In-Memory Store
// ═══════════════════════════════════════════════════════════════════════════

interface ProjectRecord {
  id: string;
  userId: string;
  title: string;
  stage: "IDEATION" | "BUILDING" | "SCALING";
  whyStatement: string;
  mvpDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

const projectStore: ProjectRecord[] = [];

function getOrCreateMockProgress(userId: string) {
  return {
    currentPart: 2,
    completionRate: 0.45,
    streakDays: 7,
    mvpLaunched: false,
    part3Activities: 3,
    totalActivities: 23,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Resolvers
// ═══════════════════════════════════════════════════════════════════════════

const resolvers = {
  Query: {
    gritScore: (_: unknown, { userId }: { userId: string }) => {
      const progress = getOrCreateMockProgress(userId);
      return calculateGritScore({
        part3CompletedActivities: progress.part3Activities,
        totalActivities: progress.totalActivities,
        streakDays: progress.streakDays,
        mvpLaunched: progress.mvpLaunched,
      });
    },
    plannerProgress: (_: unknown, { userId }: { userId: string }) => {
      return getOrCreateMockProgress(userId);
    },
  },

  Mutation: {
    updateStage: async (
      _: unknown,
      { projectId, newStage }: { projectId: string; newStage: "IDEATION" | "BUILDING" | "SCALING" },
    ) => {
      // Find existing project or infer old stage
      const project = projectStore.find((p) => p.id === projectId);
      const oldStage = project?.stage ?? "IDEATION";

      if (project) {
        project.stage = newStage;
        project.updatedAt = new Date().toISOString();
      }

      await publishStageChanged(projectId, oldStage, newStage);

      return {
        projectId,
        oldStage,
        newStage,
        eventPublished: true,
      };
    },
  },

  User: {
    __resolveReference: (ref: { id: string }) => ({ id: ref.id }),
    gritScore: (user: { id: string }) => {
      const progress = getOrCreateMockProgress(user.id);
      return calculateGritScore({
        part3CompletedActivities: progress.part3Activities,
        totalActivities: progress.totalActivities,
        streakDays: progress.streakDays,
        mvpLaunched: progress.mvpLaunched,
      });
    },
    plannerProgress: (user: { id: string }) => {
      return getOrCreateMockProgress(user.id);
    },
    projects: (user: { id: string }) => {
      const userProjects = projectStore.filter((p) => p.userId === user.id);
      if (userProjects.length === 0) {
        // Return mock project
        return [{
          id: "project-default",
          title: "My Dream Project",
          stage: "IDEATION",
          whyStatement: "To make the world a better place",
          mvpDescription: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }];
      }
      return userProjects;
    },
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

export { server, typeDefs, resolvers };
