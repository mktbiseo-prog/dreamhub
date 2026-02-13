import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@dreamhub/database";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const stripeSessionId = session.id;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      try {
        await prisma.order.update({
          where: { stripeSessionId },
          data: {
            status: "COMPLETED",
            stripePaymentId: paymentIntentId || null,
          },
        });
      } catch {
        // Order may not exist if created before DB was available
        console.error(
          `Order not found for session ${stripeSessionId}`
        );
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

      if (paymentIntentId) {
        try {
          await prisma.order.updateMany({
            where: { stripePaymentId: paymentIntentId },
            data: { status: "REFUNDED" },
          });
        } catch {
          // Ignore if order not found
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
