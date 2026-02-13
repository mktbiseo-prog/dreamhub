import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@dreamhub/database";
import { getStripe, PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { getProductById as mockGetProductById } from "@/lib/mockData";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { productId, storyId } = body;

  if (!productId || !storyId) {
    return NextResponse.json(
      { error: "Missing productId or storyId" },
      { status: 400 }
    );
  }

  // Try DB first, then mock fallback
  let productTitle: string;
  let productDescription: string;
  let productImages: string[];
  let productPrice: number;
  let creatorName: string;
  let creatorConnectId: string | null = null;

  try {
    const dbProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        dreamStory: {
          include: { user: true },
        },
      },
    });

    if (dbProduct && dbProduct.dreamStory.id === storyId) {
      productTitle = dbProduct.title;
      productDescription = `Supporting "${dbProduct.dreamStory.title}" by ${dbProduct.dreamStory.user.name || "a dreamer"}`;
      productImages = dbProduct.images;
      productPrice = dbProduct.price;
      creatorName = dbProduct.dreamStory.user.name || "a dreamer";
      creatorConnectId = dbProduct.dreamStory.user.stripeConnectId;
    } else {
      // Fallback to mock
      const mockResult = mockGetProductById(productId);
      if (!mockResult || mockResult.story.id !== storyId) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      productTitle = mockResult.product.title;
      productDescription = `Supporting "${mockResult.story.title}" by ${mockResult.story.creatorName}`;
      productImages = mockResult.product.images;
      productPrice = mockResult.product.price;
      creatorName = mockResult.story.creatorName;
    }
  } catch {
    // DB unavailable — fallback to mock
    const mockResult = mockGetProductById(productId);
    if (!mockResult || mockResult.story.id !== storyId) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    productTitle = mockResult.product.title;
    productDescription = `Supporting "${mockResult.story.title}" by ${mockResult.story.creatorName}`;
    productImages = mockResult.product.images;
    productPrice = mockResult.product.price;
    creatorName = mockResult.story.creatorName;
  }

  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json({
      message:
        "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your .env file to enable checkout.",
      demo: true,
    });
  }

  // Build session config
  const platformFee = Math.round(
    (productPrice * PLATFORM_FEE_PERCENT) / 100
  );

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productTitle,
            description: productDescription,
            images: productImages,
          },
          unit_amount: productPrice,
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
    },
  };

  // If creator has Stripe Connect, set up split payment
  if (creatorConnectId) {
    sessionConfig.payment_intent_data = {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: creatorConnectId,
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  // Create pending order
  try {
    await prisma.order.create({
      data: {
        buyerId: "demo-user", // Will be replaced with real auth
        productId,
        dreamStoryId: storyId,
        amount: productPrice,
        platformFee,
        creatorPayout: productPrice - platformFee,
        stripeSessionId: session.id,
        status: "PENDING",
      },
    });
  } catch {
    // Order creation is not critical for checkout flow
  }

  return NextResponse.json({ url: session.url });
}
