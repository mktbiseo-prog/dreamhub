// ---------------------------------------------------------------------------
// Dream Planner — GraphQL Subgraph Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll } from "vitest";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { typeDefs, resolvers } from "../route";

describe("Dream Planner Subgraph", () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
    });
    await server.start();
  });

  it("should return grit score for a user", async () => {
    const result = await server.executeOperation({
      query: `query { gritScore(userId: "user-1") }`,
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, number>;
      expect(data.gritScore).toBeGreaterThan(0);
      expect(data.gritScore).toBeLessThanOrEqual(1);
    }
  });

  it("should return planner progress", async () => {
    const result = await server.executeOperation({
      query: `
        query {
          plannerProgress(userId: "user-1") {
            currentPart
            completionRate
            streakDays
            mvpLaunched
            part3Activities
            totalActivities
          }
        }
      `,
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, Record<string, unknown>>;
      const progress = data.plannerProgress;
      expect(progress.currentPart).toBe(2);
      expect(progress.streakDays).toBe(7);
      expect(progress.mvpLaunched).toBe(false);
      expect(progress.part3Activities).toBe(3);
      expect(progress.totalActivities).toBe(23);
    }
  });

  it("should update project stage via mutation", async () => {
    const result = await server.executeOperation({
      query: `
        mutation {
          updateStage(projectId: "proj-1", newStage: BUILDING) {
            projectId
            oldStage
            newStage
            eventPublished
          }
        }
      `,
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, Record<string, unknown>>;
      expect(data.updateStage.projectId).toBe("proj-1");
      expect(data.updateStage.newStage).toBe("BUILDING");
      expect(data.updateStage.eventPublished).toBe(true);
    }
  });

  it("should resolve User entity reference with gritScore", async () => {
    const result = await server.executeOperation({
      query: `
        query ($representations: [_Any!]!) {
          _entities(representations: $representations) {
            ... on User {
              id
              gritScore
              plannerProgress {
                currentPart
                streakDays
              }
              projects {
                id
                title
                stage
              }
            }
          }
        }
      `,
      variables: {
        representations: [{ __typename: "User", id: "test-user" }],
      },
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const entities = (result.body.singleResult.data as Record<string, unknown[]>)._entities;
      const user = entities[0] as Record<string, unknown>;
      expect(user.id).toBe("test-user");
      expect(typeof user.gritScore).toBe("number");
      expect((user.plannerProgress as Record<string, unknown>).currentPart).toBe(2);
      expect(Array.isArray(user.projects)).toBe(true);
    }
  });
});
