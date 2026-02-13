"use server";

import { prisma } from "@dreamhub/database";
import { getStripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/auth";

export async function createConnectAccount() {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const userId = await requireAuth();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // If already has a connect account, create a new login link
  if (user.stripeConnectId) {
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripeConnectId
    );
    return { url: loginLink.url };
  }

  // Create Express account
  const account = await stripe.accounts.create({
    type: "express",
    email: user.email,
    metadata: { userId: user.id },
  });

  // Save connect ID to user
  await prisma.user.update({
    where: { id: userId },
    data: { stripeConnectId: account.id },
  });

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/dashboard`,
    return_url: `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/dashboard?stripe_connected=true`,
    type: "account_onboarding",
  });

  return { url: accountLink.url };
}

export async function createStripeConnectLink(): Promise<{
  success: boolean;
  url?: string;
  message?: string;
}> {
  try {
    const stripe = getStripe();

    if (!stripe) {
      // Stripe not configured - return a helpful message
      return {
        success: false,
        message:
          "Stripe is not configured yet. To receive payouts, please contact support to set up Stripe Connect for your account.",
      };
    }

    const result = await createConnectAccount();
    return { success: true, url: result.url };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      success: false,
      message: `Unable to set up Stripe Connect: ${message}`,
    };
  }
}
