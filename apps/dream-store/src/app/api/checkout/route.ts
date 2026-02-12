import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/mockData";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { productId, storyId } = body;

  if (!productId || !storyId) {
    return NextResponse.json(
      { error: "Missing productId or storyId" },
      { status: 400 }
    );
  }

  const result = getProductById(productId);
  if (!result || result.story.id !== storyId) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    // Return a friendly message when Stripe is not configured
    return NextResponse.json({
      message:
        "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your .env file to enable checkout.",
      demo: true,
    });
  }

  // Dynamic import so the app works without stripe installed
  const stripe = new (await import("stripe")).default(stripeSecretKey);

  const { product, story } = result;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title,
            description: `Supporting "${story.title}" by ${story.creatorName}`,
            images: product.images,
          },
          unit_amount: product.price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${request.nextUrl.origin}/checkout/cancel?story_id=${storyId}&product_id=${productId}`,
    metadata: {
      productId,
      storyId,
      creatorId: story.userId,
    },
  });

  return NextResponse.json({ url: session.url });
}
