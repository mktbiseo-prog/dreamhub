// ---------------------------------------------------------------------------
// Dream Brain — GraphQL Subgraph Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { typeDefs, resolvers, thoughtStore } from "../route";

describe("Dream Brain Subgraph", () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
    });
    await server.start();
  });

  beforeEach(() => {
    thoughtStore.length = 0;
  });

  it("should return empty thoughts for new user", async () => {
    const result = await server.executeOperation({
      query: `query { userThoughts(userId: "user-1") { id text category } }`,
    });

    expect(result.body.kind).toBe("single");
    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, unknown>;
      expect(data.userThoughts).toEqual([]);
    }
  });

  it("should create a thought via mutation", async () => {
    const result = await server.executeOperation({
      query: `
        mutation {
          createThought(userId: "user-1", text: "I want to build an AI app", category: "tech") {
            id
            text
            category
            valence
            arousal
            vector
          }
        }
      `,
    });

    expect(result.body.kind).toBe("single");
    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, Record<string, unknown>>;
      expect(data.createThought.text).toBe("I want to build an AI app");
      expect(data.createThought.category).toBe("tech");
      expect(data.createThought.id).toBeTruthy();
      expect(Array.isArray(data.createThought.vector)).toBe(true);
    }
  });

  it("should query thoughts after creation", async () => {
    // Create 2 thoughts
    await server.executeOperation({
      query: `mutation { createThought(userId: "user-1", text: "Thought A", category: "ideas") { id } }`,
    });
    await server.executeOperation({
      query: `mutation { createThought(userId: "user-1", text: "Thought B", category: "work") { id } }`,
    });

    const result = await server.executeOperation({
      query: `query { userThoughts(userId: "user-1") { id text category } }`,
    });

    if (result.body.kind === "single") {
      const data = result.body.singleResult.data as Record<string, Array<Record<string, unknown>>>;
      expect(data.userThoughts).toHaveLength(2);
      expect(data.userThoughts[0].text).toBe("Thought A");
      expect(data.userThoughts[1].text).toBe("Thought B");
    }
  });

  it("should return identity vector", async () => {
    const result = await server.executeOperation({
      query: `query { identityVector(userId: "user-1") }`,
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const data = result.body.singleResult.data as Record<string, number[]>;
      expect(data.identityVector).toHaveLength(16);
      expect(typeof data.identityVector[0]).toBe("number");
    }
  });

  it("should resolve User entity reference", async () => {
    // Create a thought for entity reference test
    await server.executeOperation({
      query: `mutation { createThought(userId: "entity-user", text: "test", category: "general") { id } }`,
    });

    const result = await server.executeOperation({
      query: `
        query ($representations: [_Any!]!) {
          _entities(representations: $representations) {
            ... on User {
              id
              thoughts { text }
              identityVector
              emotionProfile { dominantEmotion }
            }
          }
        }
      `,
      variables: {
        representations: [{ __typename: "User", id: "entity-user" }],
      },
    });

    if (result.body.kind === "single") {
      expect(result.body.singleResult.errors).toBeUndefined();
      const entities = (result.body.singleResult.data as Record<string, unknown[]>)._entities;
      const user = entities[0] as Record<string, unknown>;
      expect(user.id).toBe("entity-user");
      expect((user.thoughts as Array<Record<string, unknown>>)[0].text).toBe("test");
      expect(Array.isArray(user.identityVector)).toBe(true);
      expect((user.emotionProfile as Record<string, unknown>).dominantEmotion).toBe("curious");
    }
  });
});
