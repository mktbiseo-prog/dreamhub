"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  storyId: string;
  title: string;
  price: number; // cents
  image: string;
  creatorName: string;
  dreamTitle: string;
  quantity: number;
  shippingCost: number; // cents
  isDigital: boolean;
}

interface CartStore {
  items: CartItem[];
}

const CART_KEY = "dreamstore_cart";

function getStoredCart(): CartStore {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
}

function saveCart(cart: CartStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-update"));
}

// External store for SSR-safe usage
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners.push(listener);
  const handler = () => listener();
  window.addEventListener("cart-update", handler);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    window.removeEventListener("cart-update", handler);
  };
}

// Cache the snapshot so useSyncExternalStore gets referential equality
let cachedSnapshot: CartStore = { items: [] };
let cachedRaw = "";

function getSnapshot(): CartStore {
  const raw = typeof window !== "undefined"
    ? localStorage.getItem(CART_KEY) ?? ""
    : "";
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = raw ? JSON.parse(raw) : { items: [] };
  }
  return cachedSnapshot;
}

const SERVER_SNAPSHOT: CartStore = { items: [] };

function getServerSnapshot(): CartStore {
  return SERVER_SNAPSHOT;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingTotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      const current = getStoredCart();
      const existing = current.items.find(
        (i) => i.productId === item.productId
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        current.items.push({ ...item, quantity: 1 });
      }
      saveCart(current);
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    const current = getStoredCart();
    current.items = current.items.filter((i) => i.productId !== productId);
    saveCart(current);
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const current = getStoredCart();
      const item = current.items.find((i) => i.productId === productId);
      if (item) {
        if (quantity <= 0) {
          current.items = current.items.filter(
            (i) => i.productId !== productId
          );
        } else {
          item.quantity = quantity;
        }
      }
      saveCart(current);
    },
    []
  );

  const clearCart = useCallback(() => {
    saveCart({ items: [] });
  }, []);

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const shippingTotal = cart.items.reduce(
    (sum, i) => sum + (i.isDigital ? 0 : i.shippingCost * i.quantity),
    0
  );
  const total = subtotal + shippingTotal;

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shippingTotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
