// ---------------------------------------------------------------------------
// Dream Store — GraphQL Subgraph Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll } from "vitest";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { typeDefs, resolvers } from "../route";

describe("Dream Store Subgraph", () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
    });
    await server.start();
  });

  it("should return project performance", async () => {
    const result = await server.executeOperation({
      query: `
        query {
          projectPerformance(projectId: "proj-1") {
            projectId
            totalRevenue
            goalAchievementRate
            responseRate
            averageRating
            isStarSeller
          }
        }
      `,
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, Record<string, unknown>>;
      expect(data.projectPerformance.projectId).toBe("proj-1");
      expect(typeof data.projectPerformance.totalRevenue).toBe("number");
      expect(data.projectPerformance.goalAchievementRate).toBeCloseTo(0.82, 2);
    }
  });

  it("should record purchase via mutation", async () => {
    const result = await server.executeOperation({
      query: `
        mutation {
          recordPurchase(buyerId: "buyer-1", projectId: "proj-1", amount: 29.99) {
            purchaseId
            buyerId
            projectId
            amount
            verifiedAt
            eventPublished
          }
        }
      `,
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, Record<string, unknown>>;
      expect(data.recordPurchase.buyerId).toBe("buyer-1");
      expect(data.recordPurchase.projectId).toBe("proj-1");
      expect(data.recordPurchase.amount).toBe(29.99);
      expect(data.recordPurchase.eventPublished).toBe(true);
      expect(data.recordPurchase.purchaseId).toBeTruthy();
    }
  });

  it("should resolve User entity with products and performance", async () => {
    const result = await server.executeOperation({
      query: `
        query ($representations: [_Any!]!) {
          _entities(representations: $representations) {
            ... on User {
              id
              storeProducts {
                id
                title
                price
                salesCount
              }
              salesPerformance {
                totalRevenue
                isStarSeller
                averageRating
              }
            }
          }
        }
      `,
      variables: {
        representations: [{ __typename: "User", id: "seller-1" }],
      },
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const entities = (result.body.singleResult.data as Record<string, unknown[]>)._entities;
      const user = entities[0] as Record<string, unknown>;
      expect(user.id).toBe("seller-1");
      expect(Array.isArray(user.storeProducts)).toBe(true);
      expect((user.storeProducts as Array<Record<string, unknown>>).length).toBeGreaterThan(0);
      const perf = user.salesPerformance as Record<string, unknown>;
      expect(typeof perf.totalRevenue).toBe("number");
      expect(typeof perf.averageRating).toBe("number");
    }
  });
});
