"use client";

import { useState, useTransition } from "react";
import { resolveDispute } from "@/lib/actions/disputes";

interface DisputeResolverProps {
  dispute: {
    id: string;
    orderId: string;
    reason: string;
    description: string;
    status: string;
    resolution: string | null;
    resolvedAt: string | null;
    createdAt: string;
    productTitle: string;
    productImage: string;
    buyerName: string;
    buyerAvatar: string;
    sellerName: string;
    isBuyer: boolean;
    orderAmount: number;
  };
}

const REASON_LABELS: Record<string, string> = {
  not_received: "Item not received",
  not_as_described: "Item not as described",
  damaged: "Item arrived damaged",
  other: "Other issue",
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  OPEN: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Open" },
  UNDER_REVIEW: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Under Review" },
  RESOLVED_BUYER: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Resolved (Buyer Favored)" },
  RESOLVED_SELLER: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Resolved (Seller Favored)" },
  CLOSED: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", label: "Closed" },
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function DisputeResolver({ dispute }: DisputeResolverProps) {
  const [showResolve, setShowResolve] = useState(false);
  const [resolution, setResolution] = useState<"buyer" | "seller">("buyer");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const statusStyle = STATUS_STYLES[dispute.status] ?? STATUS_STYLES.OPEN;
  const isOpen = dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW";

  function handleResolve() {
    if (!message.trim()) return;
    startTransition(async () => {
      const result = await resolveDispute(dispute.id, resolution, message);
      if (!result.error) {
        setShowResolve(false);
        window.location.reload();
      }
    });
  }

  return (
    <div className="rounded-card border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex gap-4">
        {dispute.productImage && (
          <img
            src={dispute.productImage}
            alt={dispute.productTitle}
            className="h-14 w-14 shrink-0 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-900 dark:text-white">{dispute.productTitle}</h4>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            {REASON_LABELS[dispute.reason] ?? dispute.reason} &middot; Filed {dispute.createdAt} &middot; {formatPrice(dispute.orderAmount)}
          </p>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>Buyer: {dispute.buyerName}</span>
            <span>&middot;</span>
            <span>Seller: {dispute.sellerName}</span>
          </div>

          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{dispute.description}</p>

          {dispute.resolution && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
              <p className="text-xs font-medium text-gray-500">Resolution:</p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{dispute.resolution}</p>
              {dispute.resolvedAt && (
                <p className="mt-1 text-xs text-gray-400">Resolved on {dispute.resolvedAt}</p>
              )}
            </div>
          )}

          {/* Seller can resolve */}
          {!dispute.isBuyer && isOpen && !showResolve && (
            <button
              onClick={() => setShowResolve(true)}
              className="mt-3 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              Resolve Dispute
            </button>
          )}

          {showResolve && (
            <div className="mt-3 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Decision</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="radio"
                      name="resolution"
                      checked={resolution === "buyer"}
                      onChange={() => setResolution("buyer")}
                      className="text-amber-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Refund buyer</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="radio"
                      name="resolution"
                      checked={resolution === "seller"}
                      onChange={() => setResolution("seller")}
                      className="text-amber-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Release payment to me</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Resolution message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your resolution..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResolve(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={isPending || !message.trim()}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {isPending ? "Processing..." : "Confirm Resolution"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
