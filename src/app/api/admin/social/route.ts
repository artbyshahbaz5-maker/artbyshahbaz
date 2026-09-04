import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, social: data?.[0] ?? null });
}

export async function PUT(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });
  const body = await req.json();
  const { id, created_at, ...rest } = body;

  let targetId = id as string | undefined;
  if (!targetId) {
    const { data: existing } = await supabase
      .from("social_links")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1);
    targetId = existing?.[0]?.id;
  }

  const result = targetId
    ? await supabase.from("social_links").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", targetId).select().single()
    : await supabase.from("social_links").insert([rest]).select().single();

  if (result.error) return NextResponse.json({ success: false, message: result.error.message }, { status: 500 });
  return NextResponse.json({ success: true, social: result.data });
}
