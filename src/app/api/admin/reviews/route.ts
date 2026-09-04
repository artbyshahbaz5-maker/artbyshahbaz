import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });
  const { data, error } = await supabase.from("reviews").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, reviews: data });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });
  const body = await req.json();
  const { client_name, review_text, rating, event_type } = body;
  if (!client_name || !review_text) return NextResponse.json({ success: false, message: "client_name and review_text required." }, { status: 400 });
  const { data, error } = await supabase.from("reviews").insert([{ client_name, review_text, rating: rating || 5, event_type: event_type || "Bridal", is_visible: true }]).select().single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, review: data }, { status: 201 });
}
