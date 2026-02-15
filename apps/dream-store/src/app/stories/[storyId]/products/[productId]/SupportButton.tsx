"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import { formatPrice } from "@/lib/mockData";

interface SupportButtonProps {
  productId: string;
  storyId: string;
  price: number;
}

export function SupportButton({
  productId,
  storyId,
  price,
}: SupportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          storyId,
          cancelUrl: `${window.location.origin}/checkout/cancel?story_id=${storyId}&product_id=${productId}`,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Checkout is not available yet. Stripe keys are not configured.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleCheckout}
        disabled={loading}
        size="lg"
        className="w-full bg-gradient-to-r from-amber-600 to-orange-500 py-6 text-lg font-semibold text-white shadow-lg transition-all hover:from-amber-700 hover:to-orange-600 hover:shadow-xl"
      >
        {loading
          ? "Preparing checkout..."
          : `Support This Dream — ${formatPrice(price)}`}
      </Button>
      <p className="text-center text-xs text-gray-500">
        Secure checkout powered by Stripe. Your purchase directly supports this
        creator&apos;s dream.
      </p>
    </div>
  );
}
