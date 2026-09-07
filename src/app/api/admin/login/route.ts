import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const apiKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !apiKey) {
      console.error(
        "[admin/login] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
      );
      return NextResponse.json(
        { success: false, message: "Server auth is not configured." },
        { status: 500 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Reject non-allow-listed emails before hitting Supabase at all.
    if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "This account is not authorized for the admin panel." },
        { status: 403 }
      );
    }

    const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({ email: cleanEmail, password }),
      cache: "no-store",
    });

    const authData = await authRes.json();

    if (!authRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            authData.error_description ||
            authData.msg ||
            authData.message ||
            "Invalid credentials",
        },
        { status: 400 }
      );
    }

    const res = NextResponse.json({ success: true, user: authData.user });

    const secure = process.env.NODE_ENV === "production";
    res.cookies.set("sb-access-token", authData.access_token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: authData.expires_in || 3600,
      path: "/",
    });
    if (authData.refresh_token) {
      res.cookies.set("sb-refresh-token", authData.refresh_token, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days — lets the session survive past 1 hour
        path: "/",
      });
    }

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Authentication failed." },
      { status: 500 }
    );
  }
}
