import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const ACCESS_COOKIE = "sb-access-token";

// POST /api/admin/account/password
// Body: { currentPassword, newPassword }
//
// This route is already behind the admin auth middleware, so reaching it means
// the caller holds a valid admin session. We still re-verify the *current*
// password before changing it, so a hijacked/borrowed session can't silently
// reset the credentials.
export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json(
        { success: false, message: "Server auth is not configured." },
        { status: 500 },
      );
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Supabase not configured. Set SUPABASE_SERVICE_ROLE_KEY." },
        { status: 503 },
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current and new password are required." },
        { status: 400 },
      );
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters." },
        { status: 400 },
      );
    }

    // Identify the logged-in admin from the access-token cookie.
    const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "No active session." },
        { status: 401 },
      );
    }

    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!userRes.ok) {
      return NextResponse.json(
        { success: false, message: "Session expired. Please sign in again." },
        { status: 401 },
      );
    }
    const user = await userRes.json();
    const email: string | undefined = user?.email;
    const userId: string | undefined = user?.id;
    if (!email || !userId) {
      return NextResponse.json(
        { success: false, message: "Could not resolve the current account." },
        { status: 400 },
      );
    }

    // Verify the current password by attempting a password-grant sign-in.
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
      body: JSON.stringify({ email, password: currentPassword }),
      cache: "no-store",
    });
    if (!verifyRes.ok) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect." },
        { status: 400 },
      );
    }

    // Apply the new password with the service role.
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (error) {
      return NextResponse.json(
        { success: false, message: error.message || "Failed to update password." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to update password." },
      { status: 500 },
    );
  }
}
