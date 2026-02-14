import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { publishPurchaseVerified } from "@/lib/event-handlers";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

const purchaseSchema = z.object({
  projectId: z.string().min(1),
  amount: z.number().positive(),
});

export async function POST(req: Request) {
  const i18n = i18nMiddleware(req);
  try {
    const buyerId = await getCurrentUserId();
    if (!buyerId) {
      return NextResponse.json({ error: i18n.t("error.unauthorized"), meta: i18n.meta }, { status: 401 });
    }

    const body = await req.json();
    const parsed = purchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: i18n.t("error.validation"), details: parsed.error.flatten(), meta: i18n.meta },
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
      meta: i18n.meta,
    });
  } catch (error) {
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
