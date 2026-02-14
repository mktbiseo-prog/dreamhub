// ---------------------------------------------------------------------------
// Dream Place — GraphQL Subgraph Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll } from "vitest";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { typeDefs, resolvers } from "../route";

describe("Dream Place Subgraph", () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
    });
    await server.start();
  });

  it("should return match recommendations", async () => {
    const result = await server.executeOperation({
      query: `
        query {
          matchRecommendations(userId: "user-1", limit: 3) {
            userId
            score
            visionAlignment
            skillComplementarity
            explanation
          }
        }
      `,
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, Array<Record<string, unknown>>>;
      expect(data.matchRecommendations.length).toBeLessThanOrEqual(3);
      expect(data.matchRecommendations[0].score).toBeGreaterThan(0);
      expect(data.matchRecommendations[0].explanation).toBeTruthy();
    }
  });

  it("should compute match score between two users", async () => {
    const result = await server.executeOperation({
      query: `query { matchScore(userA: "user-a", userB: "user-b") }`,
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, number>;
      expect(data.matchScore).toBeGreaterThan(0);
      expect(data.matchScore).toBeLessThanOrEqual(1);
    }
  });

  it("should run stable matching via mutation", async () => {
    const result = await server.executeOperation({
      query: `
        mutation {
          runMatching(projectId: "proj-1", candidateIds: ["cand-1", "cand-2"]) {
            projectId
            matches {
              candidateId
              score
            }
            blockingPairs
            isStable
          }
        }
      `,
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, Record<string, unknown>>;
      expect(data.runMatching.projectId).toBe("proj-1");
      expect(Array.isArray(data.runMatching.matches)).toBe(true);
      expect(typeof data.runMatching.blockingPairs).toBe("number");
      expect(data.runMatching.isStable).toBe(true);
    }
  });

  it("should resolve User entity with trust and skills", async () => {
    const result = await server.executeOperation({
      query: `
        query ($representations: [_Any!]!) {
          _entities(representations: $representations) {
            ... on User {
              id
              trustIndex
              skillVector
              matchRecommendations(limit: 2) {
                score
              }
            }
          }
        }
      `,
      variables: {
        representations: [{ __typename: "User", id: "fed-user" }],
      },
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const entities = (result.body.singleResult.data as Record<string, unknown[]>)._entities;
      const user = entities[0] as Record<string, unknown>;
      expect(user.id).toBe("fed-user");
      expect(typeof user.trustIndex).toBe("number");
      expect(Array.isArray(user.skillVector)).toBe(true);
    }
  });

  it("should resolve Project entity", async () => {
    const result = await server.executeOperation({
      query: `
        query ($representations: [_Any!]!) {
          _entities(representations: $representations) {
            ... on Project {
              id
              requiredSkillVector
              gapVector
              lifecycleStage
              teamMembers { id }
            }
          }
        }
      `,
      variables: {
        representations: [{ __typename: "Project", id: "proj-test" }],
      },
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const entities = (result.body.singleResult.data as Record<string, unknown[]>)._entities;
      const project = entities[0] as Record<string, unknown>;
      expect(project.id).toBe("proj-test");
      expect(project.lifecycleStage).toBe("BUILDING");
      expect(Array.isArray(project.teamMembers)).toBe(true);
    }
  });
});
