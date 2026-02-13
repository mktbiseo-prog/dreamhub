"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import { createStripeConnectLink } from "@/lib/actions/stripe";

interface StripeConnectCardProps {
  stripeConnectId: string | null;
}

export default function StripeConnectCard({
  stripeConnectId,
}: StripeConnectCardProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleConnect() {
    setLoading(true);
    setMessage(null);

    try {
      const result = await createStripeConnectLink();

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setMessage(
          result.message || "Something went wrong. Please try again."
        );
      }
    } catch {
      setMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-card border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        Payment Settings
      </h3>
      <p className="mb-4 text-sm text-gray-500">
        Manage how you receive payouts from your dream supporters.
      </p>

      {stripeConnectId ? (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <svg
              className="h-5 w-5 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">
              Stripe account connected
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Your payouts will be sent to your connected Stripe account.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
                <svg
                  className="h-5 w-5 text-brand-600 dark:text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Set up Stripe Connect to receive payouts
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Connect your Stripe account to start receiving payouts when
                  supporters purchase your products. Stripe handles all payment
                  processing securely. You will need to provide your bank details
                  and identity verification.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleConnect} disabled={loading}>
            {loading ? "Connecting..." : "Connect with Stripe"}
          </Button>

          {message && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
