// ---------------------------------------------------------------------------
// Dream Store — GraphQL Subgraph (Federation 2.0)
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §15.1
//
// Entity:  User @key(fields: "id")
// Types:   SalesPerformance, Purchase
// Queries: projectPerformance
// Mutation: recordPurchase
// ---------------------------------------------------------------------------

import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { publishPurchaseVerified } from "@/lib/event-handlers";

// ═══════════════════════════════════════════════════════════════════════════
// Schema
// ═══════════════════════════════════════════════════════════════════════════

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external"])

  type User @key(fields: "id") {
    id: ID!
    storeProducts: [Product!]!
    salesPerformance: SalesPerformance!
  }

  type Product {
    id: ID!
    title: String!
    price: Float!
    salesCount: Int!
  }

  type SalesPerformance {
    totalRevenue: Float!
    goalAchievementRate: Float!
    responseRate: Float!
    averageRating: Float!
    isStarSeller: Boolean!
  }

  type ProjectPerformance {
    projectId: ID!
    totalRevenue: Float!
    goalAchievementRate: Float!
    responseRate: Float!
    averageRating: Float!
    isStarSeller: Boolean!
    successPatternCount: Int!
  }

  type PurchaseResult {
    purchaseId: ID!
    buyerId: ID!
    projectId: ID!
    amount: Float!
    verifiedAt: String!
    eventPublished: Boolean!
  }

  type Query {
    projectPerformance(projectId: ID!): ProjectPerformance!
  }

  type Mutation {
    recordPurchase(buyerId: ID!, projectId: ID!, amount: Float!): PurchaseResult!
  }
`;

// ═══════════════════════════════════════════════════════════════════════════
// In-Memory Store
// ═══════════════════════════════════════════════════════════════════════════

interface PurchaseRecord {
  id: string;
  buyerId: string;
  projectId: string;
  amount: number;
  verifiedAt: string;
}

const purchaseStore: PurchaseRecord[] = [];
let purchaseCounter = 0;

// ═══════════════════════════════════════════════════════════════════════════
// Resolvers
// ═══════════════════════════════════════════════════════════════════════════

const resolvers = {
  Query: {
    projectPerformance: (_: unknown, { projectId }: { projectId: string }) => {
      const projectPurchases = purchaseStore.filter((p) => p.projectId === projectId);
      const totalRevenue = projectPurchases.reduce((sum, p) => sum + p.amount, 0);

      return {
        projectId,
        totalRevenue,
        goalAchievementRate: 0.82,
        responseRate: 0.96,
        averageRating: 4.7,
        isStarSeller: totalRevenue > 1000,
        successPatternCount: Math.floor(totalRevenue / 100),
      };
    },
  },

  Mutation: {
    recordPurchase: async (
      _: unknown,
      { buyerId, projectId, amount }: { buyerId: string; projectId: string; amount: number },
    ) => {
      const id = `purchase-${++purchaseCounter}`;
      const verifiedAt = new Date().toISOString();

      const purchase: PurchaseRecord = { id, buyerId, projectId, amount, verifiedAt };
      purchaseStore.push(purchase);

      await publishPurchaseVerified(buyerId, projectId, amount);

      return {
        purchaseId: id,
        buyerId,
        projectId,
        amount,
        verifiedAt,
        eventPublished: true,
      };
    },
  },

  User: {
    __resolveReference: (ref: { id: string }) => ({ id: ref.id }),
    storeProducts: () => [
      { id: "prod-1", title: "Dream Journal", price: 19.99, salesCount: 42 },
      { id: "prod-2", title: "Vision Board Kit", price: 29.99, salesCount: 18 },
    ],
    salesPerformance: (user: { id: string }) => {
      const userPurchases = purchaseStore.filter((p) => p.buyerId === user.id);
      const totalRevenue = userPurchases.reduce((sum, p) => sum + p.amount, 0);

      return {
        totalRevenue,
        goalAchievementRate: 0.82,
        responseRate: 0.96,
        averageRating: 4.7,
        isStarSeller: totalRevenue > 1000,
      };
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

