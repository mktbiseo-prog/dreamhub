"use server";

import { prisma } from "@dreamhub/database";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitKyc(formData: FormData) {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") {
    return { error: "Please sign in to submit verification" };
  }

  const documentType = formData.get("documentType") as string;
  const documentUrl = formData.get("documentUrl") as string;

  if (!documentType || !documentUrl) {
    return { error: "Please upload a valid identification document" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });

    if (!user) return { error: "User not found" };
    if (user.kycStatus === "VERIFIED") return { error: "Already verified" };
    if (user.kycStatus === "PENDING") return { error: "Verification is already pending review" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: "PENDING",
        kycSubmittedAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to submit verification. Please try again." };
  }
}

export async function getKycStatus() {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") return { status: "UNVERIFIED" as const };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        kycStatus: true,
        kycSubmittedAt: true,
        kycVerifiedAt: true,
      },
    });

    if (!user) return { status: "UNVERIFIED" as const };

    return {
      status: user.kycStatus as "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED",
      submittedAt: user.kycSubmittedAt?.toISOString().split("T")[0] ?? null,
      verifiedAt: user.kycVerifiedAt?.toISOString().split("T")[0] ?? null,
    };
  } catch {
    return { status: "UNVERIFIED" as const };
  }
}
