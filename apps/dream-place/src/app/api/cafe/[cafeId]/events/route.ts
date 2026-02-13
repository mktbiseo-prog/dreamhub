import { NextRequest } from "next/server";
import { subscribeToCafe } from "@/lib/cafeEvents";
import type { CafeEvent } from "@/types/cafe";

// GET /api/cafe/[cafeId]/events — SSE endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  const { cafeId } = await params;

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data: string) => {
    writer.write(encoder.encode(`data: ${data}\n\n`)).catch(() => {
      // Client disconnected — ignore write errors
    });
  };

  // Send initial connection confirmation
  send(JSON.stringify({ type: "connected", cafeId }));

  // Subscribe to cafe events
  const unsubscribe = subscribeToCafe(cafeId, (event: CafeEvent) => {
    send(JSON.stringify(event));
  });

  // Heartbeat every 30 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    writer.write(encoder.encode(":ping\n\n")).catch(() => {
      // Client disconnected
    });
  }, 30_000);

  // Cleanup on client disconnect
  request.signal.addEventListener("abort", () => {
    clearInterval(heartbeat);
    unsubscribe();
    writer.close().catch(() => {
      // Already closed
    });
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// Opt out of static generation for this route
export const dynamic = "force-dynamic";
