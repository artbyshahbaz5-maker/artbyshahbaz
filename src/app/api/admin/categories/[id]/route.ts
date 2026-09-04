import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });

  try {
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) {
      patch.name = body.name.trim();
      patch.slug = slugify(body.name);
    }
    if (typeof body.sort_order === "number") patch.sort_order = body.sort_order;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, message: "Nothing to update." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("categories")
      .update(patch)
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    return NextResponse.json({ success: true, category: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });
  const { error } = await supabase.from("categories").delete().eq("id", params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
