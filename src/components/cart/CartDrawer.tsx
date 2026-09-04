"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ShoppingBag, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { CheckoutForm } from "./CheckoutForm";

type View = "cart" | "checkout" | "done";

export function CartDrawer({ phone }: { phone: string }) {
  const { items, count, isOpen, closeCart, setQty, removeItem } = useCart();
  const [view, setView] = useState<View>("cart");

  // Reset to the cart view shortly after the drawer closes.
  useEffect(() => {
    if (isOpen) return;
    const t = window.setTimeout(() => setView("cart"), 250);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  function handleOpenChange(open: boolean) {
    if (!open) closeCart();
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/60",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl",
            "duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <DialogPrimitive.Title className="font-serif text-lg font-semibold text-foreground">
              {view === "checkout"
                ? "Checkout"
                : view === "done"
                ? "Order sent"
                : `Your Cart${count > 0 ? ` (${count})` : ""}`}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close cart"
              className="rounded-md p-1.5 text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">
            Review the outfits you have added and check out on WhatsApp.
          </DialogPrimitive.Description>

          {view === "done" ? (
            <DoneView onContinue={closeCart} />
          ) : view === "checkout" ? (
            <CheckoutForm
              items={items}
              phone={phone}
              onBack={() => setView("cart")}
              onSent={() => setView("done")}
            />
          ) : items.length === 0 ? (
            <EmptyView onBrowse={closeCart} />
          ) : (
            <>
              <ul className="flex-1 overflow-y-auto divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3 p-4">
                    <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-300">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="font-serif text-sm font-semibold text-foreground hover:text-gold-600 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.price}</p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() => setQty(item.id, item.qty - 1)}
                            className="p-1.5 text-foreground/70 hover:text-foreground transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-medium tabular-nums">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() => setQty(item.id, item.qty + 1)}
                            className="p-1.5 text-foreground/70 hover:text-foreground transition-colors disabled:opacity-40"
                            disabled={item.qty >= 99}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border p-5">
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  Final pricing &amp; availability are confirmed with you on WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={() => setView("checkout")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium px-6 py-3 text-sm shadow-md transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Checkout on WhatsApp
                </button>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function EmptyView({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-muted p-5">
        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-serif text-lg font-semibold text-foreground">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add outfits you love and send them to us in one message.
        </p>
      </div>
      <Link
        href="/products"
        onClick={onBrowse}
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold-400 px-6 py-2.5 text-sm font-medium text-gold-600 hover:bg-gold-50 transition-colors"
      >
        Browse Collections
      </Link>
    </div>
  );
}

function DoneView({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-[#25D366]/10 p-5">
        <MessageCircle className="h-8 w-8 text-[#25D366]" />
      </div>
      <div>
        <p className="font-serif text-lg font-semibold text-foreground">Order sent! ✨</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We&rsquo;ve opened WhatsApp with your order. If it didn&rsquo;t open, please check your pop-up blocker.
        </p>
      </div>
      <Link
        href="/products"
        onClick={onContinue}
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold-400 px-6 py-2.5 text-sm font-medium text-gold-600 hover:bg-gold-50 transition-colors"
      >
        Continue browsing
      </Link>
    </div>
  );
}
