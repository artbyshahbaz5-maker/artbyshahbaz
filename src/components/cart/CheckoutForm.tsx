"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart, type CartItem } from "@/context/CartContext";

interface CheckoutFormProps {
  items: CartItem[];
  phone: string;
  onBack: () => void;
  onSent: () => void;
}

function buildWhatsAppUrl(items: CartItem[], phone: string, name: string, customerPhone: string) {
  const lines = [
    "Hello Art By Shahbaz! ✨ I'd like to place an order:",
    "",
    ...items.map(
      (it, i) => `${i + 1}. ${it.name} — ${it.price} (x${it.qty})`
    ),
    "",
    `Name: ${name.trim()}`,
    `Phone: ${customerPhone.trim()}`,
  ];
  const target = phone.replace(/\D/g, "");
  return `https://wa.me/${target}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function CheckoutForm({ items, phone, onBack, onSent }: CheckoutFormProps) {
  const { clear } = useCart();
  const [name, setName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next: { name?: string; phone?: string } = {};
    if (!name.trim()) next.name = "Please enter your name.";
    const digits = customerPhone.replace(/\D/g, "");
    if (digits.length < 10) next.phone = "Please enter a valid phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || !validate()) return;

    setSubmitting(true);
    const url = buildWhatsAppUrl(items, phone, name, customerPhone);
    window.open(url, "_blank", "noopener,noreferrer");
    clear();
    setSubmitting(false);
    onSent();
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to cart
        </button>

        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">Your details</h3>
          <p className="text-xs text-muted-foreground mt-1">
            We&rsquo;ll open WhatsApp with your order and details ready to send.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="checkout-name">Full name *</Label>
          <Input
            id="checkout-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ayesha Khan"
            autoComplete="name"
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="checkout-phone">Phone number *</Label>
          <Input
            id="checkout-phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="e.g. 0300 1234567"
            inputMode="tel"
            autoComplete="tel"
          />
          {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Order summary
          </p>
          <ul className="space-y-1.5">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3 text-xs text-foreground/80">
                <span className="truncate">
                  {it.name} <span className="text-muted-foreground">x{it.qty}</span>
                </span>
                <span className="whitespace-nowrap">{it.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border p-5">
        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-60 text-white font-medium px-6 py-3 text-sm shadow-md transition-colors"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
          Send order on WhatsApp
        </button>
      </div>
    </form>
  );
}
