"use client";

import { useState } from "react";

interface BuyerProtectionProps {
  sellerVerified: boolean;
  sellerBadge: string | null;
}

export function BuyerProtection({ sellerVerified, sellerBadge }: BuyerProtectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-card border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <span className="text-sm font-semibold text-green-800 dark:text-green-300">
            Dream Store Buyer Protection
          </span>
        </div>
        <svg
          className={`h-4 w-4 text-green-600 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-green-200 pt-3 dark:border-green-900/50">
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <p className="text-xs text-green-800 dark:text-green-300">
              <strong>Escrow Payment:</strong> Your payment is held securely until you confirm receipt of your order.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <p className="text-xs text-green-800 dark:text-green-300">
              <strong>Dispute Resolution:</strong> If there&apos;s an issue, our team will mediate a fair resolution.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <p className="text-xs text-green-800 dark:text-green-300">
              <strong>Refund Guarantee:</strong> Full refund if the item doesn&apos;t arrive or isn&apos;t as described.
            </p>
          </div>
          {sellerVerified && (
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <p className="text-xs text-green-800 dark:text-green-300">
                <strong>Verified Creator:</strong> This seller has completed identity verification.
                {sellerBadge && (
                  <span className="ml-1 inline-block rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {sellerBadge}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
