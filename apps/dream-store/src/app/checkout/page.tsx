import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | Dream Store",
  description: "Complete your purchase and support a dreamer.",
};

export default function CheckoutPage() {
  return (
    <main
      className="min-h-screen pb-24 lg:pb-8"
      style={{ backgroundColor: "var(--dream-color-background)" }}
    >
      <CheckoutForm />
    </main>
  );
}
