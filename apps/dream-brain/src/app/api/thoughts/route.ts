import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { publishThoughtCreated } from "@/lib/event-handlers";

const thoughtSchema = z.object({
  text: z.string().min(1).max(5000),
  category: z.string().optional(),
  vector: z.array(z.number()).optional(),
  valence: z.number().min(-1).max(1).optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = thoughtSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { text, category, vector, valence } = parsed.data;

    const thoughtId = `thought-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Generate a simple mock embedding if none provided
    // In production, this would call OpenAI text-embedding-3-small
    const thoughtVector = vector ?? Array.from({ length: 8 }, () =>
      parseFloat((Math.random() * 2 - 1).toFixed(4)),
    );

    const thoughtValence = valence ?? 0.5;

    // Publish event to event bus for cross-service consumption
    // Planner subscribes to count thoughts per user (§4.1)
    await publishThoughtCreated(
      thoughtId,
      userId,
      thoughtVector,
      thoughtValence,
    );

    return NextResponse.json({
      thought: {
        thoughtId,
        userId,
        text,
        category: category ?? "general",
        vector: thoughtVector,
        valence: thoughtValence,
        createdAt: new Date().toISOString(),
      },
      eventPublished: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
