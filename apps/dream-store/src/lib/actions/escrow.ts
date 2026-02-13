"use server";

import { prisma } from "@dreamhub/database";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function releaseEscrow(orderId: string) {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") {
    return { error: "Please sign in" };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { dreamStory: { select: { userId: true } } },
    });

    if (!order) return { error: "Order not found" };

    // Only the buyer can release escrow
    if (order.buyerId !== userId) {
      return { error: "Only the buyer can release payment" };
    }

    if (order.escrowStatus !== "HELD") {
      return { error: "Payment has already been processed" };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        escrowStatus: "RELEASED",
        escrowReleasedAt: new Date(),
        status: "COMPLETED",
      },
    });

    revalidatePath("/my-dreams");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to release payment" };
  }
}

export async function getOrdersWithEscrow(role: "buyer" | "seller") {
  const userId = await getCurrentUserId();
  if (userId === "demo-user") return [];

  try {
    const where =
      role === "buyer"
        ? { buyerId: userId }
        : { dreamStory: { userId } };

    const orders = await prisma.order.findMany({
      where: {
        ...where,
        status: { in: ["PENDING", "COMPLETED"] },
      },
      include: {
        product: { select: { title: true, images: true, isDigital: true } },
        dreamStory: {
          select: {
            title: true,
            user: { select: { name: true, avatar: true, kycStatus: true } },
          },
        },
        buyer: { select: { name: true, avatar: true } },
        disputes: {
          where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return orders.map((o) => ({
      id: o.id,
      productTitle: o.product.title,
      productImage: o.product.images[0] ?? "",
      isDigital: o.product.isDigital,
      storyTitle: o.dreamStory.title,
      sellerName: o.dreamStory.user.name ?? "Anonymous",
      sellerAvatar: o.dreamStory.user.avatar ?? "",
      sellerKycStatus: o.dreamStory.user.kycStatus,
      buyerName: o.buyer.name ?? "Anonymous",
      buyerAvatar: o.buyer.avatar ?? "",
      amount: o.amount,
      quantity: o.quantity,
      status: o.status,
      escrowStatus: o.escrowStatus,
      shippingStatus: o.shippingStatus,
      trackingNumber: o.trackingNumber,
      hasOpenDispute: o.disputes.length > 0,
      createdAt: o.createdAt.toISOString().split("T")[0],
    }));
  } catch {
    return [];
  }
}
