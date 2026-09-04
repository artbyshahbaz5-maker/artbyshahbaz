import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "./supabase/admin";
import type { SiteData, Product, Category, GalleryItem, Banner, Review, FAQ, SiteSettings, SocialLinks } from "@/types";

const FALLBACK_DATA_FILE = path.join(process.cwd(), "old", "data", "data.json");

export function getLocalFallbackData(): SiteData {
  try {
    if (fs.existsSync(FALLBACK_DATA_FILE)) {
      const raw = fs.readFileSync(FALLBACK_DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      return {
        settings: parsed.settings || {
          title: "Bridal Dresses in Clifton Karachi | Art By Shahbaz",
          description: "Luxury bridal lehengas, wedding dresses, and formal wear.",
          about_html: parsed.settings?.about || "",
          phone1: "+92 300 0000000",
          hours_weekday: "11:00 AM - 9:00 PM",
        },
        social: parsed.social || {
          instagram: "https://instagram.com/artbyshahbaz",
          tiktok: "",
          facebook: "",
          youtube: "",
          whatsapp: "+923000000000",
        },
        categories: (parsed.categories || []).map((c: any) => ({
          id: c.id || String(Math.random()),
          name: c.name || c.title || "Collection",
          slug: c.slug || (c.name ? c.name.toLowerCase().replace(/\s+/g, "-") : "collection"),
        })),
        products: (parsed.products || []).map((p: any) => ({
          id: p.id || String(Math.random()),
          name: p.name || p.title || "Bridal Outfit",
          slug: p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `outfit-${p.id}`),
          price: p.price || "Price on Request",
          description: p.description || "",
          image_url: p.image || p.image_url || "/placeholder-dress.jpg",
          category_id: p.category_id || p.category || "",
          is_featured: p.is_featured ?? true,
          is_active: p.is_active ?? true,
        })),
        gallery: (parsed.gallery || []).map((g: any, idx: number) => ({
          id: g.id || `gallery-${idx}`,
          title: g.title || "Bridal Collection",
          image_url: typeof g === "string" ? g : (g.image || g.image_url || ""),
          category: g.category || "Bridal",
        })),
        banners: (parsed.banners || []).map((b: any, idx: number) => ({
          id: b.id || `banner-${idx}`,
          title: b.title || "Art By Shahbaz",
          subtitle: b.subtitle || "Couture Bridal & Formal Wear",
          image_url: typeof b === "string" ? b : (b.image || b.image_url || ""),
          button_text: b.button_text || "Explore Collection",
          button_link: b.button_link || "/products",
          is_active: true,
        })),
        reviews: (parsed.reviews || []).map((r: any, idx: number) => ({
          id: r.id || `review-${idx}`,
          client_name: r.name || r.client_name || "Satisfied Bride",
          review_text: r.text || r.review_text || "Amazing craftsmanship and personalized fitting.",
          rating: r.rating || 5,
          event_type: r.event_type || "Bridal",
        })),
        faqs: (parsed.faqs || []).map((f: any, idx: number) => ({
          id: f.id || `faq-${idx}`,
          question: f.question || "How do I order?",
          answer: f.answer || "You can click on the WhatsApp button to book an appointment or order directly.",
        })),
      };
    }
  } catch (err) {
    console.error("Error reading fallback data:", err);
  }

  return {
    settings: {
      title: "Art By Shahbaz | Luxury Bridal & Formal Wear",
      description: "Designer bridal lehengas & formal wear in Clifton, Karachi.",
      about_html: "<p>Art By Shahbaz offers bespoke bridal couture crafted with master hand-embroidery.</p>",
      phone1: "+92 300 0000000",
      hours_weekday: "11:00 AM - 9:00 PM",
    },
    social: {
      instagram: "https://instagram.com/artbyshahbaz",
      tiktok: "",
      facebook: "",
      youtube: "",
      whatsapp: "+923000000000",
    },
    categories: [
      { id: "cat-1", name: "Bridal Lehenga", slug: "bridal-lehenga" },
      { id: "cat-2", name: "Walima Maxi", slug: "walima-maxi" },
      { id: "cat-3", name: "Mehndi Outfits", slug: "mehndi-outfits" },
      { id: "cat-4", name: "Formal Wear", slug: "formal-wear" },
    ],
    products: [],
    gallery: [],
    banners: [],
    reviews: [],
    faqs: [],
  };
}

// Run one Supabase select in isolation so a single failing table can never
// wipe out every other section of the site. Errors are logged (visible in the
// Vercel function logs) and that table falls back to an empty list.
async function safeSelect<T>(
  label: string,
  builder: PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  try {
    const { data, error } = await builder;
    if (error) {
      console.error(`[data-store] "${label}" query failed: ${error.message}`);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error(`[data-store] "${label}" query threw:`, err);
    return [];
  }
}

export async function getFullSiteData(): Promise<SiteData> {
  const supabase = getSupabaseAdmin();

  // Only fall back to bundled demo content when Supabase isn't configured at
  // all. When it IS configured we return exactly what the database holds — even
  // an empty list — so the admin panel's real state is what visitors see.
  if (!supabase) {
    console.warn(
      "[data-store] Supabase not configured (missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY) — serving demo data.",
    );
    return getLocalFallbackData();
  }

  const fallback = getLocalFallbackData();

  const [
    settingsRes,
    socialRes,
    categories,
    products,
    gallery,
    banners,
    reviews,
    faqs,
  ] = await Promise.all([
    supabase.from("settings").select("*").order("updated_at", { ascending: false }).limit(1),
    supabase.from("social_links").select("*").order("updated_at", { ascending: false }).limit(1),
    safeSelect<Category>("categories", supabase.from("categories").select("*").order("sort_order", { ascending: true })),
    safeSelect<Product>("products", supabase.from("products").select("*, categories(name)").order("sort_order", { ascending: true })),
    safeSelect<GalleryItem>("gallery", supabase.from("gallery").select("*").order("sort_order", { ascending: true })),
    safeSelect<Banner>("banners", supabase.from("banners").select("*").order("sort_order", { ascending: true })),
    safeSelect<Review>("reviews", supabase.from("reviews").select("*").order("sort_order", { ascending: true })),
    safeSelect<FAQ>("faqs", supabase.from("faqs").select("*").order("sort_order", { ascending: true })),
  ]);

  if (settingsRes.error) console.error(`[data-store] "settings" query failed: ${settingsRes.error.message}`);
  if (socialRes.error) console.error(`[data-store] "social_links" query failed: ${socialRes.error.message}`);

  return {
    settings: (settingsRes.data?.[0] as SiteSettings) || fallback.settings,
    social: (socialRes.data?.[0] as SocialLinks) || fallback.social,
    categories,
    products,
    gallery,
    banners,
    reviews,
    faqs,
  };
}
