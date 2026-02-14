// ---------------------------------------------------------------------------
// Dream Hub — Apollo Federation Gateway
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §15
//
// Composes 4 subgraphs into a single supergraph:
//   - Dream Brain  (port 3003) → thoughts, identity vectors
//   - Dream Planner (port 3001) → grit score, planner progress
//   - Dream Place  (port 3004) → matching, trust, recommendations
//   - Dream Store  (port 3002) → purchases, sales performance
//
// Clients access ONE URL (port 4000) for all data.
// ---------------------------------------------------------------------------

import { ApolloServer } from "@apollo/server";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { startStandaloneServer } from "@apollo/server/standalone";

const GATEWAY_PORT = parseInt(process.env.GATEWAY_PORT ?? "4000", 10);

// Subgraph service URLs
const subgraphs = [
  { name: "brain", url: process.env.BRAIN_URL ?? "http://localhost:3003/api/graphql" },
  { name: "planner", url: process.env.PLANNER_URL ?? "http://localhost:3001/api/graphql" },
  { name: "place", url: process.env.PLACE_URL ?? "http://localhost:3004/api/graphql" },
  { name: "store", url: process.env.STORE_URL ?? "http://localhost:3002/api/graphql" },
];

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({ subgraphs }),
});

const server = new ApolloServer({ gateway });

async function main() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: GATEWAY_PORT },
  });

  console.log(`\n🚀 Dream Hub Gateway ready at ${url}`);
  console.log("\nSubgraphs:");
  for (const sg of subgraphs) {
    console.log(`  • ${sg.name}: ${sg.url}`);
  }
  console.log(
    "\nExample query:\n" +
    "  {\n" +
    '    user(id: "user-1") {\n' +
    "      gritScore\n" +
    "      matchRecommendations { score }\n" +
    "      thoughts { text }\n" +
    "    }\n" +
    "  }\n",
  );
}

main().catch(console.error);

export { gateway, server, subgraphs };
