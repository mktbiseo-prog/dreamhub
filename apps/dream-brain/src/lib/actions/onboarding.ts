"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

export async function completeOnboarding(input: {
  name?: string;
  dreamStatement?: string;
  interests?: string[];
}) {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") return;

  if (!process.env.DATABASE_URL) return;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.dreamStatement ? { dreamStatement: input.dreamStatement } : {}),
        ...(input.interests?.length ? { interests: input.interests } : {}),
        onboardingCompleted: true,
      },
    });
  } catch (e) {
    console.error("Failed to save onboarding status:", e);
    return;
  }

  revalidatePath("/");
}
