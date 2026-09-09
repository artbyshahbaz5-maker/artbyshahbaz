import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductCardGallery } from "@/components/ProductCardGallery";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop";

interface ProductCardProps {
  product: Product;
  whatsappPhone?: string;
}

export function ProductCard({ product }: ProductCardProps) {
  const images = [product.image_url, ...(product.gallery_urls ?? [])]
    .map((u) => (u ?? "").trim())
    .filter(Boolean);
  if (images.length === 0) images.push(PLACEHOLDER_IMAGE);

  return (
    <div className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] bg-neutral-100 overflow-hidden"
        aria-label={`View ${product.name}`}
      >
        <ProductCardGallery images={images} alt={product.name} />
        {product.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="gold" className="text-xs font-medium shadow">
              ✦ Featured
            </Badge>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        {product.category_name && (
          <p className="text-xs text-gold-600 font-medium tracking-widest uppercase mb-1">
            {product.category_name}
          </p>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="font-serif text-base font-semibold text-foreground hover:text-gold-600 transition-colors line-clamp-2 block mb-2"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between gap-2 mt-3">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(product.price || "")}
          </span>
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price || "",
              image_url: product.image_url,
            }}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
