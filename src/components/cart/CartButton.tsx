"use client";

import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function CartButton({ className }: { className?: string }) {
  const { count, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
      className={cn(
        "relative p-2 rounded-md text-foreground/70 hover:text-gold-600 hover:bg-muted transition-colors",
        className
      )}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gold-500 text-neutral-950 text-[10px] font-bold leading-none tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
