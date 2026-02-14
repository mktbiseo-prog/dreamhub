"use client";

import { useState, useTransition } from "react";
import { releaseEscrow } from "@/lib/actions/escrow";
import { DisputeForm } from "./DisputeForm";

interface OrderEscrowCardProps {
  order: {
    id: string;
    productTitle: string;
    productImage: string;
    isDigital: boolean;
    storyTitle: string;
    sellerName: string;
    sellerAvatar: string;
    sellerKycStatus: string;
    amount: number;
    quantity: number;
    status: string;
    escrowStatus: string;
    shippingStatus: string;
    trackingNumber: string | null;
    hasOpenDispute: boolean;
    createdAt: string;
  };
  role: "buyer" | "seller";
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

const ESCROW_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  HELD: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Payment Held" },
  RELEASED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Payment Released" },
  DISPUTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Disputed" },
  REFUNDED: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", label: "Refunded" },
};

const SHIPPING_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", label: "Preparing" },
  SHIPPED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Shipped" },
  IN_TRANSIT: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400", label: "In Transit" },
  DELIVERED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Delivered" },
};

export function OrderEscrowCard({ order, role }: OrderEscrowCardProps) {
  const [showDispute, setShowDispute] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [released, setReleased] = useState(false);

  const escrowStyle = ESCROW_STATUS_STYLES[released ? "RELEASED" : order.escrowStatus] ?? ESCROW_STATUS_STYLES.HELD;
  const shippingStyle = SHIPPING_STATUS_STYLES[order.shippingStatus] ?? SHIPPING_STATUS_STYLES.PENDING;

  function handleRelease() {
    if (!confirm("Confirm you have received your order? This will release payment to the creator.")) return;
    startTransition(async () => {
      const result = await releaseEscrow(order.id);
      if (!result.error) setReleased(true);
    });
  }

  const canRelease = role === "buyer" && order.escrowStatus === "HELD" && !released;
  const canDispute = role === "buyer" && order.escrowStatus === "HELD" && !order.hasOpenDispute;

  return (
    <>
      <div className="rounded-card border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex gap-4">
          {order.productImage && (
            <img
              src={order.productImage}
              alt={order.productTitle}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="truncate font-medium text-gray-900 dark:text-white">
                  {order.productTitle}
                </h4>
                <p className="text-xs text-gray-500">{order.storyTitle}</p>
              </div>
              <p className="shrink-0 font-semibold text-gray-900 dark:text-white">
                {formatPrice(order.amount)}
              </p>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* Escrow badge */}
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${escrowStyle.bg} ${escrowStyle.text}`}>
                <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                {escrowStyle.label}
              </span>

              {/* Shipping badge (physical only) */}
              {!order.isDigital && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${shippingStyle.bg} ${shippingStyle.text}`}>
                  {shippingStyle.label}
                </span>
              )}

              {/* Verified seller */}
              {order.sellerKycStatus === "VERIFIED" && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  Verified Seller
                </span>
              )}

              {/* Tracking number */}
              {order.trackingNumber && (
                <span className="text-xs text-gray-500">
                  Tracking: {order.trackingNumber}
                </span>
              )}
            </div>

            {/* Seller info */}
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              {order.sellerAvatar ? (
                <img src={order.sellerAvatar} alt={order.sellerName} className="h-4 w-4 rounded-full object-cover" />
              ) : (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[8px] font-bold text-white">
                  {order.sellerName.charAt(0)}
                </div>
              )}
              <span>by {order.sellerName}</span>
              <span>&middot;</span>
              <span>{order.createdAt}</span>
            </div>

            {/* Actions */}
            {(canRelease || canDispute) && (
              <div className="mt-3 flex gap-2">
                {canRelease && (
                  <button
                    onClick={handleRelease}
                    disabled={isPending}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {isPending ? "Releasing..." : "Confirm Received"}
                  </button>
                )}
                {canDispute && (
                  <button
                    onClick={() => setShowDispute(true)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    File Dispute
                  </button>
                )}
              </div>
            )}

            {order.hasOpenDispute && (
              <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                Dispute in progress
              </p>
            )}
          </div>
        </div>
      </div>

      {showDispute && (
        <DisputeForm
          orderId={order.id}
          productTitle={order.productTitle}
          onClose={() => setShowDispute(false)}
          onSuccess={() => {
            setShowDispute(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
