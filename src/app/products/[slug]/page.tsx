import { getFullSiteData } from "@/lib/data-store";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { products } = await getFullSiteData();
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | Bridal & Formal Wear`,
    description: product.description || `Buy ${product.name} at Art By Shahbaz in Clifton, Karachi.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getFullSiteData();
  const { products, settings, social } = data;
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const phone = social.whatsapp || settings.phone1 || "923001234567";
  const related = products
    .filter((p) => p.id !== product.id && (product.category_id ? p.category_id === product.category_id : true))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-gold-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gold-600 transition-colors">Collections</Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 shadow-md">
            <Image
              src={
                product.image_url ||
                "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop"
              }
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {product.gallery_urls && product.gallery_urls.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {product.gallery_urls.map((url, i) => (
                <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 border border-border">
                  <Image src={url} alt={`${product.name} gallery ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col justify-center">
          {product.category_name && (
            <p className="text-xs text-gold-600 font-semibold tracking-widest uppercase mb-2">
              {product.category_name}
            </p>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            {product.name}
          </h1>

          <div className="text-2xl font-bold text-gold-600 mb-6">
            {formatPrice(product.price || "")}
          </div>

          <div className="prose prose-sm text-muted-foreground mb-8 leading-relaxed">
            <p>{product.description || "Handcrafted with supreme care and attention to detail. Available for bespoke sizing and custom bridal fitting at our Clifton, Karachi atelier."}</p>
          </div>

          <div className="p-6 bg-bridal-cream/60 border border-gold-200/60 rounded-2xl mb-8 space-y-4">
            <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
              ✨ Add to Cart & Inquiries
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add this outfit to your cart and check out on WhatsApp, or message us directly for sizing, custom embroidery requests, or visiting our boutique.
            </p>
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price || "",
                image_url: product.image_url,
              }}
              size="lg"
              withQuantity
            />
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            <WhatsAppButton
              productName={product.name}
              price={product.price}
              phoneNumber={phone}
              size="lg"
              className="w-full justify-center"
            />
          </div>

          <div className="border-t border-border pt-6 space-y-2 text-xs text-muted-foreground">
            <p>📍 <strong>Location:</strong> Shop #38, Kehkashan Arcade, Clifton, Karachi</p>
            <p>🕒 <strong>Timings:</strong> Mon – Sat: 11:00 AM – 9:00 PM</p>
            <p>🧵 <strong>Custom Orders:</strong> Made-to-measure with hand-worked embellishments</p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-border pt-16">
          <div className="text-center mb-10">
            <p className="text-gold-500 text-xs tracking-widest uppercase font-medium">You May Also Like</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1">Related Outfits</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} whatsappPhone={phone} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
