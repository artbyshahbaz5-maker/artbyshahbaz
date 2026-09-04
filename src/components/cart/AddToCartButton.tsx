"use client";

import { useState } from "react";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Pick<Product, "id" | "name" | "slug" | "price" | "image_url">;
  size?: "sm" | "default" | "lg";
  className?: string;
  withQuantity?: boolean;
}

export function AddToCartButton({
  product,
  size = "default",
  className,
  withQuantity = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className={cn("flex items-center gap-2", withQuantity && "w-full")}>
      {withQuantity && (
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2 text-foreground/70 hover:text-foreground transition-colors disabled:opacity-40"
            disabled={qty <= 1}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="p-2 text-foreground/70 hover:text-foreground transition-colors disabled:opacity-40"
            disabled={qty >= 99}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={handleAdd}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-full shadow-md transition-all duration-200 hover:scale-105 active:scale-95",
          "bg-gold-500 hover:bg-gold-400 text-neutral-950",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "default" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-7 py-3.5 text-base",
          withQuantity && "flex-1",
          className
        )}
      >
        {added ? (
          <>
            <Check className={iconSize} />
            Added
          </>
        ) : (
          <>
            <ShoppingBag className={iconSize} />
            {size === "sm" ? "Add" : "Add to Cart"}
          </>
        )}
      </button>
    </div>
  );
}
