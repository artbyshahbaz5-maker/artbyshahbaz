"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types";

const PAGE_SIZE = 6;

export function FeaturedProducts({
  products,
  phone,
}: {
  products: Product[];
  phone: string;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = products.slice(0, visible);
  const remaining = products.length - visible;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map((product) => (
          <ProductCard key={product.id} product={product} whatsappPhone={phone} />
        ))}
      </div>

      {remaining > 0 && (
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-neutral-950 font-semibold px-8 py-3 rounded-full text-sm tracking-wide transition-all hover:scale-105 shadow"
          >
            Show More
            <span className="text-neutral-950/60">
              ({Math.min(PAGE_SIZE, remaining)} of {remaining})
            </span>
          </button>
        </div>
      )}
    </>
  );
}
