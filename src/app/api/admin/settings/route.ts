import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });
  const { data, error } = await supabase.from("settings").select("*").maybeSingle();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, settings: data });
}

export async function PUT(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Supabase not configured." }, { status: 503 });
  const body = await req.json();
  const { id, ...rest } = body;

  let result;
  if (id) {
    result = await supabase.from("settings").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  } else {
    result = await supabase.from("settings").insert([rest]).select().single();
  }
  if (result.error) return NextResponse.json({ success: false, message: result.error.message }, { status: 500 });
  return NextResponse.json({ success: true, settings: result.data });
}
