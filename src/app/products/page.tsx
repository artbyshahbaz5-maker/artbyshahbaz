import { getFullSiteData } from "@/lib/data-store";
import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridal & Formal Wear Collections",
  description: "Browse luxury bridal lehengas, walima maxi, mehndi outfits, and formal wear. Order on WhatsApp.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const data = await getFullSiteData();
  const { products, categories, social, settings } = data;
  const phone = social.whatsapp || settings.phone1 || "923001234567";

  const activeCategory = searchParams.category || "all";
  const searchQuery = searchParams.search?.toLowerCase() || "";

  const filtered = products.filter((p) => {
    const matchCat =
      activeCategory === "all" ||
      categories.find((c) => c.slug === activeCategory)?.id === p.category_id;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery) ||
      (p.description || "").toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-gold-500 text-xs tracking-[0.35em] uppercase font-medium mb-2">✦ Our Collections</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Bridal & Formal Wear</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Each piece is hand-crafted for your most precious moments. Order directly on WhatsApp for custom fitting.
        </p>
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-5" />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <a
          href="/products"
          className={`text-xs font-medium tracking-widest uppercase px-5 py-2.5 border rounded-full transition-all ${
            activeCategory === "all"
              ? "bg-gold-500 text-white border-gold-500"
              : "border-gold-300 text-gold-700 hover:bg-gold-50"
          }`}
        >
          All
        </a>
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`text-xs font-medium tracking-widest uppercase px-5 py-2.5 border rounded-full transition-all ${
              activeCategory === cat.slug
                ? "bg-gold-500 text-white border-gold-500"
                : "border-gold-300 text-gold-700 hover:bg-gold-50"
            }`}
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No outfits found.</p>
          <a href="/products" className="mt-4 inline-block text-gold-500 hover:underline text-sm">
            Clear filters
          </a>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Showing {filtered.length} outfit{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} whatsappPhone={phone} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
