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
    refresh_url: `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/stories/create`,
    return_url: `${process.env.NEXTAUTH_URL || "http://localhost:3002"}/stories/create?stripe_connected=true`,
    type: "account_onboarding",
  });

  return { url: accountLink.url };
}
