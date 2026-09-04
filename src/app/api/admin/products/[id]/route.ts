import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// PUT /api/admin/products/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });

  try {
    const body = await req.json();

    // Whitelist real columns — reject nested relations (e.g. `categories`) and
    // read-only fields (`id`, `slug`, `created_at`) that would fail the update.
    const ALLOWED = [
      "name", "description", "price", "image_url", "category_id",
      "gallery_urls", "is_featured", "is_active", "sort_order",
    ] as const;
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of ALLOWED) {
      if (key in body) patch[key] = body[key];
    }
    if (patch.category_id === "") patch.category_id = null;

    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });

  const { error } = await supabase.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
