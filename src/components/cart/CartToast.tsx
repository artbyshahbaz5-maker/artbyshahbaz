"use client";

import { useEffect } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Brief "added to cart" confirmation. Replaces auto-opening the full cart
// drawer on every add. Auto-dismisses; "View" opens the drawer on demand.
export function CartToast() {
  const { toast, clearToast, openCart } = useCart();

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(clearToast, 2600);
    return () => window.clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[60] w-full max-w-sm -translate-x-1/2 px-3 sm:left-auto sm:right-4 sm:translate-x-0 sm:px-0"
    >
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-neutral-900 py-2 pl-4 pr-2 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-neutral-950">
          <Check className="h-4 w-4" />
        </span>
        <p className="min-w-0 flex-1 truncate text-sm">{toast.message}</p>
        <button
          type="button"
          onClick={() => openCart()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/20"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> View
        </button>
      </div>
    </div>
  );
}
