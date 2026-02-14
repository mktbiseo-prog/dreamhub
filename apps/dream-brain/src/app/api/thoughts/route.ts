import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { publishThoughtCreated } from "@/lib/event-handlers";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

let thoughtRepo: {
  create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  listByUser: (userId: string, params?: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
} | null = null;

function tryLoadRepo(): void {
  if (thoughtRepo || !process.env.DATABASE_URL) return;
  try {
    const db = require("@dreamhub/database");
    thoughtRepo = db.thoughtRepo;
  } catch {}
}

const thoughtSchema = z.object({
  text: z.string().min(1).max(5000),
  category: z.string().optional(),
  vector: z.array(z.number()).optional(),
  valence: z.number().min(-1).max(1).optional(),
});

export async function POST(req: Request) {
  const i18n = i18nMiddleware(req);
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
    }

    const body = await req.json();
    const parsed = thoughtSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: i18n.t("error.validation"), details: parsed.error.flatten(), meta: i18n.meta },
        { status: 400 },
      );
    }

    const { text, category, vector, valence } = parsed.data;

    // Generate a simple mock embedding if none provided
    // In production, this would call OpenAI text-embedding-3-small
    const thoughtVector = vector ?? Array.from({ length: 8 }, () =>
      parseFloat((Math.random() * 2 - 1).toFixed(4)),
    );

    const thoughtValence = valence ?? 0.5;

    // Try to persist to DB via repository
    tryLoadRepo();
    let thoughtId: string;

    if (thoughtRepo) {
      const thought = await thoughtRepo.create({
        user: { connect: { id: userId } },
        title: text.slice(0, 100),
        body: text,
        category: (category ?? "IDEAS").toUpperCase(),
        embedding: thoughtVector,
        valence: thoughtValence,
      });
      thoughtId = (thought as { id: string }).id;
    } else {
      thoughtId = `thought-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

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
      persisted: !!thoughtRepo,
      meta: i18n.meta,
    });
  } catch (error) {
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
