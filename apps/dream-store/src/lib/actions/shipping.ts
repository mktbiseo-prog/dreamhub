"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

export async function updateTrackingNumber(
  orderId: string,
  trackingNumber: string
) {
  const userId = await getCurrentUserId();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { dreamStory: { select: { userId: true } } },
  });

  if (!order || order.dreamStory.userId !== userId) {
    throw new Error("Order not found or access denied");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingNumber,
      shippingStatus: "SHIPPED",
    },
  });

  revalidatePath("/dashboard");
}

export async function updateShippingStatus(
  orderId: string,
  status: "PENDING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED"
) {
  const userId = await getCurrentUserId();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { dreamStory: { select: { userId: true } } },
  });

  if (!order || order.dreamStory.userId !== userId) {
    throw new Error("Order not found or access denied");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { shippingStatus: status },
  });

  // Auto-release escrow when delivered
  if (status === "DELIVERED") {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        escrowStatus: "RELEASED",
        escrowReleasedAt: new Date(),
      },
    });
  }

  revalidatePath("/dashboard");
}

export async function confirmDelivery(orderId: string) {
  const userId = await getCurrentUserId();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.buyerId !== userId) {
    throw new Error("Order not found or access denied");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      shippingStatus: "DELIVERED",
      escrowStatus: "RELEASED",
      escrowReleasedAt: new Date(),
    },
  });

  revalidatePath("/my-dreams");
}
