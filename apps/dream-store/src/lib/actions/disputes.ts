"use server";

import { prisma } from "@dreamhub/database";
import { getCurrentUserId } from "@/lib/auth";
import { createDisputeSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createDispute(formData: FormData) {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") {
    return { error: "Please sign in to file a dispute" };
  }

  const raw = {
    orderId: formData.get("orderId") as string,
    reason: formData.get("reason") as string,
    description: formData.get("description") as string,
  };

  const parsed = createDisputeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    // Verify the order belongs to this buyer
    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { dreamStory: { select: { userId: true } } },
    });

    if (!order) return { error: "Order not found" };
    if (order.buyerId !== userId) return { error: "You can only dispute your own orders" };
    if (order.escrowStatus === "REFUNDED") return { error: "This order has already been refunded" };

    // Check for existing open dispute
    const existing = await prisma.dispute.findFirst({
      where: {
        orderId: parsed.data.orderId,
        status: { in: ["OPEN", "UNDER_REVIEW"] },
      },
    });
    if (existing) return { error: "A dispute is already open for this order" };

    // Create dispute and update escrow status
    await prisma.$transaction([
      prisma.dispute.create({
        data: {
          orderId: parsed.data.orderId,
          buyerId: userId,
          sellerId: order.dreamStory.userId,
          reason: parsed.data.reason,
          description: parsed.data.description,
        },
      }),
      prisma.order.update({
        where: { id: parsed.data.orderId },
        data: { escrowStatus: "DISPUTED" },
      }),
    ]);

    revalidatePath("/my-dreams");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to create dispute. Please try again." };
  }
}

export async function getMyDisputes() {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") return [];

  try {
    const disputes = await prisma.dispute.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        order: {
          include: {
            product: { select: { title: true, images: true } },
            dreamStory: { select: { title: true } },
          },
        },
        buyer: { select: { name: true, avatar: true } },
        seller: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return disputes.map((d) => ({
      id: d.id,
      orderId: d.orderId,
      reason: d.reason,
      description: d.description,
      status: d.status,
      resolution: d.resolution,
      resolvedAt: d.resolvedAt?.toISOString().split("T")[0] ?? null,
      createdAt: d.createdAt.toISOString().split("T")[0],
      productTitle: d.order.product.title,
      productImage: d.order.product.images[0] ?? "",
      storyTitle: d.order.dreamStory.title,
      buyerName: d.buyer.name ?? "Anonymous",
      buyerAvatar: d.buyer.avatar ?? "",
      sellerName: d.seller.name ?? "Anonymous",
      sellerAvatar: d.seller.avatar ?? "",
      isBuyer: d.buyerId === userId,
      orderAmount: d.order.amount,
    }));
  } catch {
    return [];
  }
}

export async function resolveDispute(
  disputeId: string,
  resolution: "buyer" | "seller",
  message: string
) {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") {
    return { error: "Please sign in" };
  }

  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { order: true },
    });

    if (!dispute) return { error: "Dispute not found" };
    if (dispute.sellerId !== userId) return { error: "Only the seller can resolve disputes" };
    if (dispute.status !== "OPEN" && dispute.status !== "UNDER_REVIEW") {
      return { error: "This dispute is already resolved" };
    }

    const newStatus = resolution === "buyer" ? "RESOLVED_BUYER" : "RESOLVED_SELLER";
    const escrowStatus = resolution === "buyer" ? "REFUNDED" : "RELEASED";

    await prisma.$transaction([
      prisma.dispute.update({
        where: { id: disputeId },
        data: {
          status: newStatus,
          resolution: message,
          resolvedAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: dispute.orderId },
        data: {
          escrowStatus,
          ...(escrowStatus === "RELEASED" ? { escrowReleasedAt: new Date() } : {}),
          ...(escrowStatus === "REFUNDED" ? { status: "REFUNDED" } : {}),
        },
      }),
    ]);

    revalidatePath("/my-dreams");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to resolve dispute" };
  }
}
