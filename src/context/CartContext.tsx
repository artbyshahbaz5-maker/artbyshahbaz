"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: string;
  image_url: string;
  qty: number;
}

type AddableProduct = Pick<Product, "id" | "name" | "slug" | "price" | "image_url">;

interface CartContextValue {
  items: CartItem[];
  count: number;
  addItem: (product: AddableProduct, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "abs_cart";
const MAX_QTY = 99;

function isValidItem(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const i = x as Record<string, unknown>;
  return (
    typeof i.id === "string" &&
    typeof i.name === "string" &&
    typeof i.slug === "string" &&
    typeof i.qty === "number" &&
    i.qty > 0
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(isValidItem).map((i) => ({
              ...i,
              qty: Math.min(Math.max(1, Math.round(i.qty)), MAX_QTY),
            }))
          );
        }
      }
    } catch {
      /* corrupt or unavailable storage — start empty */
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after the initial hydration read).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked — cart still works for this session */
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: AddableProduct, qty = 1) => {
    const add = Math.min(Math.max(1, Math.round(qty)), MAX_QTY);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: Math.min(i.qty + add, MAX_QTY) }
            : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price?.trim() || "Price on Request",
          image_url: product.image_url || "",
          qty: add,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    const next = Math.round(qty);
    setItems((prev) =>
      next <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) =>
            i.id === id ? { ...i, qty: Math.min(next, MAX_QTY) } : i
          )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = useMemo(
    () => items.reduce((n, i) => n + i.qty, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      addItem,
      removeItem,
      setQty,
      clear,
      isOpen,
      openCart,
      closeCart,
    }),
    [items, count, addItem, removeItem, setQty, clear, isOpen, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
