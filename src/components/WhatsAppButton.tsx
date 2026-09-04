"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  productName: string;
  price?: string;
  productUrl?: string;
  phoneNumber?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function WhatsAppButton({
  productName,
  price,
  productUrl,
  phoneNumber = "923001234567",
  className,
  size = "default",
}: WhatsAppButtonProps) {
  const handleOrder = () => {
    const phone = phoneNumber.replace(/[^0-9]/g, "");
    const currentUrl =
      productUrl ||
      (typeof window !== "undefined" ? window.location.href : "https://artbyshahbaz.com");

    const lines = [
      "Hello Art By Shahbaz! ✨",
      "",
      `I'm interested in ordering/inquiring about:`,
      `👗 *Outfit:* ${productName}`,
    ];
    if (price) lines.push(`💰 *Price:* ${price}`);
    lines.push(`🔗 *Link:* ${currentUrl}`);
    lines.push("", "Please let me know about availability and custom fitting.");

    const message = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleOrder}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-md",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "default" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        "bg-[#25D366] hover:bg-[#20bd5a] text-white",
        className
      )}
    >
      <MessageCircle className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5")} />
      {size === "sm" ? "Order" : "Order via WhatsApp"}
    </button>
  );
}
