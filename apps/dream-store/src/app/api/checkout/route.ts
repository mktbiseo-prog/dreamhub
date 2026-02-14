import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@dreamhub/database";
import { getStripe, PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { getProductById as mockGetProductById } from "@/lib/mockData";
import { getCurrentUserId } from "@/lib/auth";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

interface CartItemInput {
  productId: string;
  storyId: string;
  quantity: number;
}

interface ResolvedProduct {
  productId: string;
  storyId: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  quantity: number;
  creatorName: string;
  creatorConnectId: string | null;
}

async function resolveProduct(
  productId: string,
  storyId: string,
  quantity: number
): Promise<ResolvedProduct | null> {
  try {
    const dbProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        dreamStory: { include: { user: true } },
      },
    });

    if (dbProduct && dbProduct.dreamStory.id === storyId) {
      return {
        productId,
        storyId,
        title: dbProduct.title,
        description: `Supporting "${dbProduct.dreamStory.title}" by ${dbProduct.dreamStory.user.name || "a dreamer"}`,
        images: dbProduct.images,
        price: dbProduct.price,
        quantity,
        creatorName: dbProduct.dreamStory.user.name || "a dreamer",
        creatorConnectId: dbProduct.dreamStory.user.stripeConnectId,
      };
    }
  } catch {
    // DB unavailable
  }

  // Fallback to mock
  const mockResult = mockGetProductById(productId);
  if (!mockResult || mockResult.story.id !== storyId) return null;

  return {
    productId,
    storyId,
    title: mockResult.product.title,
    description: `Supporting "${mockResult.story.title}" by ${mockResult.story.creatorName}`,
    images: mockResult.product.images,
    price: mockResult.product.price,
    quantity,
    creatorName: mockResult.story.creatorName,
    creatorConnectId: null,
  };
}

export async function POST(request: NextRequest) {
  const i18n = i18nMiddleware(request);
  const body = await request.json();
  const buyerId = await getCurrentUserId();

  // Support both single-item and multi-item checkout
  let cartItems: CartItemInput[];
  const shippingAddress = body.shippingAddress || null;

  if (body.items && Array.isArray(body.items)) {
    cartItems = body.items;
  } else if (body.productId && body.storyId) {
    cartItems = [
      { productId: body.productId, storyId: body.storyId, quantity: 1 },
    ];
  } else {
    return NextResponse.json(
      { error: i18n.t("error.validation"), meta: i18n.meta },
      { status: 400 }
    );
  }

  // Resolve all products
  const resolved = await Promise.all(
    cartItems.map((item) =>
      resolveProduct(item.productId, item.storyId, item.quantity || 1)
    )
  );

  const products = resolved.filter(Boolean) as ResolvedProduct[];
  if (products.length === 0) {
    return NextResponse.json({ error: i18n.t("error.validation"), meta: i18n.meta }, { status: 404 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({
      message: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your .env file to enable checkout.",
      demo: true,
      meta: i18n.meta,
    });
  }

  // Build line items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = products.map(
    (p) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: p.title,
          description: p.description,
          images: p.images.slice(0, 8), // Stripe limits to 8 images
        },
        unit_amount: p.price,
      },
      quantity: p.quantity,
    })
  );

  // Calculate total for fee
  const totalAmount = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  const platformFee = Math.round(
    (totalAmount * PLATFORM_FEE_PERCENT) / 100
  );

  // Use the first product's creator for Connect (simplified for MVP)
  const primaryCreatorConnectId = products.find(
    (p) => p.creatorConnectId
  )?.creatorConnectId;

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${request.nextUrl.origin}/checkout/cancel`,
    metadata: {
      productIds: products.map((p) => p.productId).join(","),
      storyIds: products.map((p) => p.storyId).join(","),
      quantities: products.map((p) => p.quantity).join(","),
    },
    // Collect shipping if any physical product
    shipping_address_collection: products.some(
      (p) => !p.description.includes("Digital")
    )
      ? { allowed_countries: ["US", "CA", "GB", "AU", "KR", "JP", "DE", "FR"] }
      : undefined,
  };

  // If creator has Stripe Connect
  if (primaryCreatorConnectId) {
    sessionConfig.payment_intent_data = {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: primaryCreatorConnectId,
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  // Create pending orders for each product
  try {
    for (const p of products) {
      const itemTotal = p.price * p.quantity;
      const itemFee = Math.round(
        (itemTotal * PLATFORM_FEE_PERCENT) / 100
      );
      await prisma.order.create({
        data: {
          buyerId,
          productId: p.productId,
          dreamStoryId: p.storyId,
          amount: itemTotal,
          quantity: p.quantity,
          platformFee: itemFee,
          creatorPayout: itemTotal - itemFee,
          stripeSessionId: products.indexOf(p) === 0 ? session.id : `${session.id}_${p.productId}`,
          status: "PENDING",
          shippingAddress: shippingAddress || undefined,
          escrowStatus: "HELD",
        },
      });
    }
  } catch {
    // Order creation is not critical for checkout flow
  }

  return NextResponse.json({ url: session.url, meta: i18n.meta });
}
