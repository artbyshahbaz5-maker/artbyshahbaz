import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Package, Images, Layers, Star, Image } from "lucide-react";
import Link from "next/link";

async function getCounts() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { products: 0, gallery: 0, categories: 0, reviews: 0, banners: 0 };
  const [p, g, c, r, b] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("gallery").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("banners").select("id", { count: "exact", head: true }),
  ]);
  return {
    products: p.count || 0,
    gallery: g.count || 0,
    categories: c.count || 0,
    reviews: r.count || 0,
    banners: b.count || 0,
  };
}

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const counts = await getCounts();

  const cards = [
    { label: "Products", value: counts.products, href: "/admin/products", icon: Package, color: "text-blue-400" },
    { label: "Gallery Items", value: counts.gallery, href: "/admin/gallery", icon: Images, color: "text-purple-400" },
    { label: "Categories", value: counts.categories, href: "/admin/categories", icon: Layers, color: "text-gold-400" },
    { label: "Reviews", value: counts.reviews, href: "/admin/reviews", icon: Star, color: "text-yellow-400" },
    { label: "Banners", value: counts.banners, href: "/admin/banners", icon: Image, color: "text-emerald-400" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-neutral-400 mb-10">Welcome back — manage your Art By Shahbaz website content.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {cards.map(({ label, value, href, icon: Icon, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-gold-500/30 transition-colors group"
          >
            <Icon className={`h-6 w-6 mb-3 ${color} group-hover:scale-110 transition-transform`} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-neutral-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-1">Quick Actions</h2>
        <p className="text-neutral-400 text-sm mb-5">Jump straight to common tasks.</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Add Product", href: "/admin/products?action=add" },
            { label: "Upload Gallery Photo", href: "/admin/gallery?action=add" },
            { label: "Manage Settings", href: "/admin/settings" },
            { label: "View Live Site", href: "/", external: true },
          ].map(({ label, href, external }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="px-4 py-2 text-sm bg-neutral-800 hover:bg-gold-500/10 border border-neutral-700 hover:border-gold-500/30 text-neutral-300 hover:text-gold-300 rounded-lg transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
