"use client";

import { useState } from "react";
import { Button } from "@dreamhub/ui";
import { useCart, type CartItem } from "./CartContext";

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    isDigital?: boolean;
    shippingCost?: number;
  };
  story: {
    id: string;
    title: string;
    creatorName: string;
  };
  className?: string;
}

export function AddToCartButton({
  product,
  story,
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      storyId: story.id,
      title: product.title,
      price: product.price,
      image: product.images[0] || "",
      creatorName: story.creatorName,
      dreamTitle: story.title,
      shippingCost: product.shippingCost || 0,
      isDigital: product.isDigital || false,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button
      onClick={handleAdd}
      className={
        className ||
        "w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg hover:from-amber-700 hover:to-orange-600"
      }
    >
      {added ? (
        <span className="flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Added to Dream Basket!
        </span>
      ) : (
        "Add to Dream Basket"
      )}
    </Button>
  );
}
