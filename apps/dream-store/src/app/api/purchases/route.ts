import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { publishPurchaseVerified } from "@/lib/event-handlers";

const purchaseSchema = z.object({
  projectId: z.string().min(1),
  amount: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const buyerId = await getCurrentUserId();
    if (!buyerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = purchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { projectId, amount } = parsed.data;

    const purchaseId = `purchase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const verifiedAt = new Date().toISOString();

    // Publish event to event bus for cross-service consumption
    // Place subscribes to accumulate execution score (§4.3)
    await publishPurchaseVerified(buyerId, projectId, amount);

    return NextResponse.json({
      purchase: {
        purchaseId,
        buyerId,
        projectId,
        amount,
        verifiedAt,
      },
      eventPublished: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
