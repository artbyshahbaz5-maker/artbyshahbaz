import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });
  const { data, error } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, banners: data });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });
  const body = await req.json();
  const { image_url, title, subtitle, button_text, button_link, sort_order } = body;
  if (!image_url) return NextResponse.json({ success: false, message: "image_url is required." }, { status: 400 });
  const { data, error } = await supabase.from("banners").insert([{ image_url, title, subtitle, button_text, button_link, sort_order: sort_order ?? 0, is_active: true }]).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, banner: data }, { status: 201 });
}
