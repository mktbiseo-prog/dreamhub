"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@dreamhub/ui";
import { useCart } from "./CartContext";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    shippingTotal,
    total,
  } = useCart();

  function handleCheckout() {
    if (items.length === 0) return;
    setOpen(false);
    window.location.href = "/checkout";
  }

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <svg
          className="h-5 w-5"
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
        <span className="hidden sm:inline">Dream Basket</span>
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-600 to-orange-500 text-[10px] font-bold text-white">
            {itemCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-950">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Dream Basket
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <p className="text-sm text-gray-500">
                    Your dream basket is empty
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Discover dreams to support!
                  </p>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="mt-4 text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    Explore Dreams
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 rounded-card border border-gray-200 p-3 dark:border-gray-800"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-amber-600">
                          {item.dreamTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {item.creatorName}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-xs dark:border-gray-700"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-xs dark:border-gray-700"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="shrink-0 self-start text-gray-400 hover:text-red-500"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={clearCart}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {shippingTotal > 0 && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Shipping</span>
                      <span>{formatPrice(shippingTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-white">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <Button
                  className="mt-4 w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg hover:from-amber-700 hover:to-orange-600"
                  onClick={handleCheckout}
                >
                  {`Checkout — ${formatPrice(total)}`}
                </Button>
                <p className="mt-2 text-center text-xs text-gray-400">
                  Secure checkout powered by Stripe
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
