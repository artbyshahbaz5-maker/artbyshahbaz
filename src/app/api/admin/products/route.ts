import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/admin/products
export async function GET(_req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, products: data });
}

// POST /api/admin/products
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });

  try {
    const body = await req.json();
    const { name, description, price, image_url, category_id, gallery_urls, is_featured, is_active, sort_order } = body;

    if (!name || !image_url) {
      return NextResponse.json({ success: false, message: "Name and image_url are required." }, { status: 400 });
    }

    const slug = slugify(name) + "-" + Date.now().toString(36);

    const { data, error } = await supabase.from("products").insert([{
      name, slug, description, price, image_url, category_id: category_id || null,
      gallery_urls: gallery_urls || [], is_featured: is_featured ?? false,
      is_active: is_active ?? true, sort_order: sort_order ?? 0,
    }]).select().single();

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    return NextResponse.json({ success: true, product: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
