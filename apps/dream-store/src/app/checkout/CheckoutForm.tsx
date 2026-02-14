"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { useCart } from "@/components/cart/CartContext";

type PaymentMethod = "card" | "kakao" | "apple" | "google";

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "KR", label: "South Korea" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "AU", label: "Australia" },
  { code: "JP", label: "Japan" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
];

const TAX_RATE = 0; // simplified — real tax calculation would be server-side

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CheckoutForm() {
  const {
    items,
    subtotal,
    shippingTotal,
    total,
    removeItem,
    updateQuantity,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const hasPhysicalItem = items.some((i) => !i.isDigital);
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const grandTotal = total + taxAmount;

  // Primary dreamer for CTA personalization
  const primaryDreamer = items[0]?.creatorName || "a Dreamer";

  // Group items by dreamer for emotional display
  const groupedByDreamer = useMemo(() => {
    const map = new Map<
      string,
      { creatorName: string; dreamTitle: string; items: typeof items }
    >();
    for (const item of items) {
      const key = item.storyId;
      const group = map.get(key);
      if (group) {
        group.items.push(item);
      } else {
        map.set(key, {
          creatorName: item.creatorName,
          dreamTitle: item.dreamTitle,
          items: [item],
        });
      }
    }
    return Array.from(map.values());
  }, [items]);

  // BNPL availability (items over $50)
  const bnplAvailable = grandTotal >= 5000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            storyId: i.storyId,
            quantity: i.quantity,
          })),
          shippingAddress: hasPhysicalItem ? shipping : null,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.demo) {
        alert(data.message);
      }
    } catch {
      alert("Checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  function updateShipping(field: keyof ShippingAddress, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--dream-color-primary-lighter)" }}
        >
          <svg
            className="h-12 w-12"
            style={{ color: "var(--dream-color-primary)" }}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </div>
        <h2
          className="mb-2 text-2xl font-bold"
          style={{ color: "var(--dream-color-headline)" }}
        >
          Your basket is empty
        </h2>
        <p className="mb-6 text-gray-500">
          Discover dreams to support and make a difference.
        </p>
        <Link href="/">
          <Button
            size="lg"
            className="rounded-[12px] px-8 font-semibold text-white"
            style={{ backgroundColor: "var(--dream-color-primary)" }}
          >
            Explore Dreams
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Continue Shopping
          </Link>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--dream-color-headline)" }}
          >
            Checkout
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* ─── Left Column: Forms ─── */}
          <div className="space-y-6 lg:col-span-3">
            {/* ── Order Summary ── */}
            <section
              className="overflow-hidden rounded-[16px] border shadow-sm"
              style={{
                borderColor: "var(--dream-neutral-200, #e5e5e5)",
                backgroundColor: "var(--dream-color-surface)",
              }}
            >
              <div className="border-b p-5" style={{ borderColor: "var(--dream-neutral-200, #e5e5e5)" }}>
                <h2
                  className="text-lg font-bold"
                  style={{ color: "var(--dream-color-headline)" }}
                >
                  Order Summary
                </h2>
              </div>

              <div className="divide-y" style={{ borderColor: "var(--dream-neutral-200, #e5e5e5)" }}>
                {groupedByDreamer.map((group) => (
                  <div key={group.dreamTitle} className="p-5">
                    {/* Dreamer context */}
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dream-color-primary-dark)" }}>
                      From {group.creatorName}&apos;s dream
                    </p>
                    <p className="mb-4 text-sm text-gray-500">
                      {group.dreamTitle}
                    </p>

                    {/* Items */}
                    <div className="space-y-4">
                      {group.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex gap-4"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-20 w-20 shrink-0 rounded-[12px] object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-sm font-semibold"
                              style={{ color: "var(--dream-color-headline)" }}
                            >
                              {item.title}
                            </p>
                            <p
                              className="mt-1 text-sm font-bold"
                              style={{ color: "var(--dream-color-primary)" }}
                            >
                              {formatPrice(item.price)}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                                style={{ borderColor: "var(--dream-neutral-300, #d4d4d4)" }}
                              >
                                -
                              </button>
                              <span className="min-w-[20px] text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                                style={{ borderColor: "var(--dream-neutral-300, #d4d4d4)" }}
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId)}
                                className="ml-auto text-xs text-gray-400 transition-colors hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Impact Recap Card ── */}
            <section
              className="rounded-[16px] p-5"
              style={{ backgroundColor: "var(--dream-color-accent-light, #FCE7F3)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--dream-color-accent, #E11D73)" }}
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "var(--dream-color-accent, #E11D73)" }}
                  >
                    Your Impact
                  </h3>
                  <p className="mt-1 text-sm text-gray-700">
                    Your purchase supports{" "}
                    <span className="font-semibold">{primaryDreamer}</span>
                    &apos;s dream.{" "}
                    {groupedByDreamer.length > 1
                      ? `You're supporting ${groupedByDreamer.length} dreamers with this order.`
                      : "Every purchase brings them one step closer to their goal."}
                  </p>
                </div>
              </div>
            </section>

            {/* ── Shipping Address ── */}
            {hasPhysicalItem && (
              <section
                className="overflow-hidden rounded-[16px] border shadow-sm"
                style={{
                  borderColor: "var(--dream-neutral-200, #e5e5e5)",
                  backgroundColor: "var(--dream-color-surface)",
                }}
              >
                <div className="border-b p-5" style={{ borderColor: "var(--dream-neutral-200, #e5e5e5)" }}>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "var(--dream-color-headline)" }}
                  >
                    Shipping Address
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Pre-filled from your Dream ID profile
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  {/* Full Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.fullName}
                      onChange={(e) => updateShipping("fullName", e.target.value)}
                      className="h-[48px] w-full rounded-[12px] border bg-white px-4 text-base outline-none transition-colors focus:border-2 dark:bg-gray-900 dark:text-white"
                      style={{
                        borderColor: "var(--dream-neutral-300, #d4d4d4)",
                      }}
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.addressLine1}
                      onChange={(e) => updateShipping("addressLine1", e.target.value)}
                      className="h-[48px] w-full rounded-[12px] border bg-white px-4 text-base outline-none transition-colors focus:border-2 dark:bg-gray-900 dark:text-white"
                      style={{
                        borderColor: "var(--dream-neutral-300, #d4d4d4)",
                      }}
                      placeholder="Street address"
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <input
                      type="text"
                      value={shipping.addressLine2}
                      onChange={(e) => updateShipping("addressLine2", e.target.value)}
                      className="h-[48px] w-full rounded-[12px] border bg-white px-4 text-base outline-none transition-colors focus:border-2 dark:bg-gray-900 dark:text-white"
                      style={{
                        borderColor: "var(--dream-neutral-300, #d4d4d4)",
                      }}
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  {/* City + State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={shipping.city}
                        onChange={(e) => updateShipping("city", e.target.value)}
                        className="h-[48px] w-full rounded-[12px] border bg-white px-4 text-base outline-none transition-colors focus:border-2 dark:bg-gray-900 dark:text-white"
                        style={{
                          borderColor: "var(--dream-neutral-300, #d4d4d4)",
                        }}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={shipping.state}
                        onChange={(e) => updateShipping("state", e.target.value)}
                        className="h-[48px] w-full rounded-[12px] border bg-white px-4 text-base outline-none transition-colors focus:border-2 dark:bg-gray-900 dark:text-white"
                        style={{
                          borderColor: "var(--dream-neutral-300, #d4d4d4)",
                        }}
                        placeholder="State"
                      />
                    </div>
                  </div>

                  {/* Postal + Country */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={shipping.postalCode}
                        onChange={(e) => updateShipping("postalCode", e.target.value)}
                        className="h-[48px] w-full rounded-[12px] border bg-white px-4 text-base outline-none transition-colors focus:border-2 dark:bg-gray-900 dark:text-white"
                        style={{
                          borderColor: "var(--dream-neutral-300, #d4d4d4)",
                        }}
                        placeholder="Postal code"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country
                      </label>
                      <select
                        value={shipping.country}
                        onChange={(e) => updateShipping("country", e.target.value)}
                        className="h-[48px] w-full rounded-[12px] border bg-white px-4 text-base outline-none transition-colors focus:border-2 dark:bg-gray-900 dark:text-white"
                        style={{
                          borderColor: "var(--dream-neutral-300, #d4d4d4)",
                        }}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Estimated delivery */}
                  <div
                    className="flex items-center gap-2 rounded-[12px] px-4 py-3"
                    style={{ backgroundColor: "var(--dream-color-primary-lighter, #FFFBEB)" }}
                  >
                    <svg
                      className="h-5 w-5 shrink-0"
                      style={{ color: "var(--dream-color-primary-dark)" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-1.5a.75.75 0 01-.75-.75V8.625c0-.621-.504-1.125-1.125-1.125H16.5M3.375 14.25h3.75m0 0V11.25m0 3h10.5"
                      />
                    </svg>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--dream-color-primary-dark)" }}
                    >
                      Estimated delivery: 5-10 business days
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* ── Payment Method ── */}
            <section
              className="overflow-hidden rounded-[16px] border shadow-sm"
              style={{
                borderColor: "var(--dream-neutral-200, #e5e5e5)",
                backgroundColor: "var(--dream-color-surface)",
              }}
            >
              <div className="border-b p-5" style={{ borderColor: "var(--dream-neutral-200, #e5e5e5)" }}>
                <h2
                  className="text-lg font-bold"
                  style={{ color: "var(--dream-color-headline)" }}
                >
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3 p-5">
                {/* KakaoPay */}
                <PaymentOption
                  id="kakao"
                  label="KakaoPay"
                  sublabel="Recommended for Korea"
                  selected={paymentMethod === "kakao"}
                  onSelect={() => setPaymentMethod("kakao")}
                  icon={
                    <span className="flex h-8 w-12 items-center justify-center rounded-md bg-[#FEE500] text-[10px] font-extrabold text-[#3C1E1E]">
                      kakao
                    </span>
                  }
                />

                {/* Credit / Debit Card */}
                <PaymentOption
                  id="card"
                  label="Credit / Debit Card"
                  sublabel="Visa, Mastercard, AMEX"
                  selected={paymentMethod === "card"}
                  onSelect={() => setPaymentMethod("card")}
                  icon={
                    <div className="flex gap-1">
                      <span className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-[8px] font-bold text-white">
                        VISA
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded bg-red-500 text-[8px] font-bold text-white">
                        MC
                      </span>
                    </div>
                  }
                />

                {/* Apple Pay */}
                <PaymentOption
                  id="apple"
                  label="Apple Pay"
                  selected={paymentMethod === "apple"}
                  onSelect={() => setPaymentMethod("apple")}
                  icon={
                    <span className="flex h-8 w-10 items-center justify-center rounded-md bg-black text-xs text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                    </span>
                  }
                />

                {/* Google Pay */}
                <PaymentOption
                  id="google"
                  label="Google Pay"
                  selected={paymentMethod === "google"}
                  onSelect={() => setPaymentMethod("google")}
                  icon={
                    <span className="flex h-8 w-10 items-center justify-center rounded-md border bg-white text-xs font-bold text-gray-700">
                      G
                    </span>
                  }
                />

                {/* BNPL hint */}
                {bnplAvailable && (
                  <div
                    className="mt-2 rounded-[12px] px-4 py-3 text-sm"
                    style={{ backgroundColor: "var(--dream-color-primary-lighter, #FFFBEB)" }}
                  >
                    <span
                      className="font-medium"
                      style={{ color: "var(--dream-color-primary-dark)" }}
                    >
                      Buy Now, Pay Later available
                    </span>
                    <span className="text-gray-500"> — split into 4 interest-free payments at checkout.</span>
                  </div>
                )}
              </div>
            </section>

            {/* ── Guest Checkout Notice ── */}
            {guestMode && (
              <section
                className="rounded-[16px] border p-5"
                style={{
                  borderColor: "var(--dream-color-primary-light, #FEF3C7)",
                  backgroundColor: "var(--dream-color-primary-lighter, #FFFBEB)",
                }}
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0"
                    style={{ color: "var(--dream-color-primary)" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--dream-color-primary-dark)" }}
                    >
                      Save 5% as a Dream Hub member
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Sign in with your Dream ID to unlock member pricing, track your supported dreams, and get updates from dreamers.
                    </p>
                    <Link
                      href="/auth/sign-in"
                      className="mt-2 inline-block text-sm font-semibold underline"
                      style={{ color: "var(--dream-color-primary)" }}
                    >
                      Sign in or create a Dream ID
                    </Link>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ─── Right Column: Price Summary (sticky) ─── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <section
                className="overflow-hidden rounded-[16px] border shadow-sm"
                style={{
                  borderColor: "var(--dream-neutral-200, #e5e5e5)",
                  backgroundColor: "var(--dream-color-surface)",
                }}
              >
                <div className="border-b p-5" style={{ borderColor: "var(--dream-neutral-200, #e5e5e5)" }}>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "var(--dream-color-headline)" }}
                  >
                    Price Details
                  </h2>
                </div>

                <div className="space-y-3 p-5 text-sm">
                  {/* Subtotal */}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>
                      Subtotal ({items.reduce((s, i) => s + i.quantity, 0)}{" "}
                      {items.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "items"})
                    </span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>
                      {shippingTotal === 0 ? (
                        <span style={{ color: "var(--dream-impact-funded, #22C55E)" }}>
                          Free
                        </span>
                      ) : (
                        formatPrice(shippingTotal)
                      )}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Estimated Tax</span>
                    <span>{taxAmount === 0 ? "Calculated at payment" : formatPrice(taxAmount)}</span>
                  </div>

                  {/* Platform fee transparency */}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      Platform Fee (10%)
                      <span className="cursor-help text-gray-400" title="This small fee keeps Dream Store running and ensures buyer protection.">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                        </svg>
                      </span>
                    </span>
                    <span>Included</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t pt-3" style={{ borderColor: "var(--dream-neutral-200, #e5e5e5)" }}>
                    <div className="flex items-baseline justify-between">
                      <span
                        className="text-base font-bold"
                        style={{ color: "var(--dream-color-headline)" }}
                      >
                        Total
                      </span>
                      <span
                        className="text-xl font-bold"
                        style={{ color: "var(--dream-color-primary)" }}
                      >
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Impact mini-card inside summary */}
                <div
                  className="mx-5 mb-5 rounded-[12px] p-4"
                  style={{ backgroundColor: "var(--dream-color-accent-light, #FCE7F3)" }}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 shrink-0"
                      style={{ color: "var(--dream-color-accent, #E11D73)" }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--dream-color-accent, #E11D73)" }}
                    >
                      90% goes directly to {primaryDreamer}
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="p-5 pt-0">
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex h-[48px] w-full items-center justify-center rounded-[12px] text-base font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                    style={{ backgroundColor: "var(--dream-color-accent, #E11D73)" }}
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Complete — Support ${primaryDreamer}'s Dream`
                    )}
                  </button>

                  {/* Secure checkout note */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                    <span>Secure checkout with buyer protection</span>
                  </div>

                  {/* Guest checkout link */}
                  {!guestMode && (
                    <button
                      type="button"
                      onClick={() => setGuestMode(true)}
                      className="mt-3 w-full text-center text-xs text-gray-400 underline transition-colors hover:text-gray-600"
                    >
                      Continue as guest
                    </button>
                  )}
                </div>
              </section>

              {/* Trust badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Escrow Protected
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  SSL Encrypted
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                  </svg>
                  Refund Guarantee
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky CTA ── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t p-4 lg:hidden"
        style={{
          borderColor: "var(--dream-neutral-200, #e5e5e5)",
          backgroundColor: "var(--dream-color-surface)",
        }}
      >
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium text-gray-600">Total</span>
          <span
            className="text-lg font-bold"
            style={{ color: "var(--dream-color-primary)" }}
          >
            {formatPrice(grandTotal)}
          </span>
        </div>
        <button
          type="submit"
          disabled={processing}
          className="flex h-[48px] w-full items-center justify-center rounded-[12px] text-base font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "var(--dream-color-accent, #E11D73)" }}
        >
          {processing ? "Processing..." : `Complete — Support ${primaryDreamer}'s Dream`}
        </button>
      </div>
    </form>
  );
}

/* ── Payment Option Radio ── */
function PaymentOption({
  id,
  label,
  sublabel,
  selected,
  onSelect,
  icon,
}: {
  id: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
}) {
  return (
    <label
      htmlFor={`pay-${id}`}
      className="flex min-h-[56px] cursor-pointer items-center gap-4 rounded-[12px] border px-4 py-3 transition-all"
      style={{
        borderColor: selected
          ? "var(--dream-color-primary)"
          : "var(--dream-neutral-200, #e5e5e5)",
        backgroundColor: selected
          ? "var(--dream-color-primary-lighter, #FFFBEB)"
          : "transparent",
      }}
    >
      <input
        type="radio"
        id={`pay-${id}`}
        name="paymentMethod"
        checked={selected}
        onChange={onSelect}
        className="h-4 w-4 accent-amber-500"
      />
      {icon}
      <div className="flex-1">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </span>
        {sublabel && (
          <span className="ml-2 text-xs text-gray-400">{sublabel}</span>
        )}
      </div>
    </label>
  );
}
