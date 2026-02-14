// ---------------------------------------------------------------------------
// Dream Brain — GraphQL Subgraph (Federation 2.0)
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §15.1
//
// Entity:  User @key(fields: "id")
// Types:   Thought, EmotionProfile
// Queries: userThoughts, identityVector
// Mutation: createThought
// ---------------------------------------------------------------------------

import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { publishThoughtCreated } from "@/lib/event-handlers";

// ═══════════════════════════════════════════════════════════════════════════
// Schema
// ═══════════════════════════════════════════════════════════════════════════

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external"])

  type User @key(fields: "id") {
    id: ID!
    thoughts: [Thought!]!
    identityVector: [Float!]!
    emotionProfile: EmotionProfile!
  }

  type Thought {
    id: ID!
    text: String!
    vector: [Float!]!
    valence: Float!
    arousal: Float!
    category: String!
    createdAt: String!
  }

  type EmotionProfile {
    dominantEmotion: String!
    valenceHistory: [Float!]!
    arousalHistory: [Float!]!
  }

  type Query {
    userThoughts(userId: ID!): [Thought!]!
    identityVector(userId: ID!): [Float!]!
  }

  type Mutation {
    createThought(userId: ID!, text: String!, category: String): Thought!
  }
`;

// ═══════════════════════════════════════════════════════════════════════════
// In-Memory Store (mock data until DB is connected)
// ═══════════════════════════════════════════════════════════════════════════

interface ThoughtRecord {
  id: string;
  userId: string;
  text: string;
  vector: number[];
  valence: number;
  arousal: number;
  category: string;
  createdAt: string;
}

const thoughtStore: ThoughtRecord[] = [];
let thoughtCounter = 0;

function generateMockVector(): number[] {
  return Array.from({ length: 8 }, (_, i) => Math.sin(i * 0.7) * 0.5 + 0.5);
}

// ═══════════════════════════════════════════════════════════════════════════
// Resolvers
// ═══════════════════════════════════════════════════════════════════════════

const resolvers = {
  Query: {
    userThoughts: (_: unknown, { userId }: { userId: string }) => {
      return thoughtStore.filter((t) => t.userId === userId);
    },
    identityVector: (_: unknown, { userId }: { userId: string }) => {
      // Mock identity vector — in production, aggregated from thought embeddings
      return Array.from({ length: 16 }, (_, i) =>
        Math.sin((userId.charCodeAt(0) + i) * 0.3) * 0.5 + 0.5,
      );
    },
  },

  Mutation: {
    createThought: async (
      _: unknown,
      { userId, text, category }: { userId: string; text: string; category?: string },
    ) => {
      const id = `thought-${++thoughtCounter}`;
      const vector = generateMockVector();
      const valence = Math.random() * 2 - 1; // [-1, 1]
      const arousal = Math.random(); // [0, 1]

      const thought: ThoughtRecord = {
        id,
        userId,
        text,
        vector,
        valence,
        arousal,
        category: category ?? "general",
        createdAt: new Date().toISOString(),
      };

      thoughtStore.push(thought);

      // Publish event to event-bus
      await publishThoughtCreated(id, userId, vector, valence);

      return thought;
    },
  },

  User: {
    __resolveReference: (ref: { id: string }) => {
      return { id: ref.id };
    },
    thoughts: (user: { id: string }) => {
      return thoughtStore.filter((t) => t.userId === user.id);
    },
    identityVector: (user: { id: string }) => {
      return Array.from({ length: 16 }, (_, i) =>
        Math.sin((user.id.charCodeAt(0) + i) * 0.3) * 0.5 + 0.5,
      );
    },
    emotionProfile: (user: { id: string }) => {
      const userThoughts = thoughtStore.filter((t) => t.userId === user.id);
      return {
        dominantEmotion: userThoughts.length > 0 ? "curious" : "neutral",
        valenceHistory: userThoughts.map((t) => t.valence),
        arousalHistory: userThoughts.map((t) => t.arousal),
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

// Export for testing
export { server, typeDefs, resolvers, thoughtStore };
