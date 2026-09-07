import { NextRequest, NextResponse } from "next/server";

// ── Admin auth ──────────────────────────────────────────────────────────────
// This middleware is the security boundary for BOTH the admin HTML pages
// (`/admin/*`) and the admin API (`/api/admin/*`). It does not merely check
// that a session cookie exists — it validates the access token against
// Supabase Auth on every request, transparently refreshes an expired token,
// and (optionally) enforces an email allow-list.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Comma-separated list of emails allowed into the admin panel. If unset, any
// authenticated Supabase user is allowed (matches the previous behaviour, but
// now the token is actually verified).
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const ACCESS_COOKIE = "sb-access-token";
const REFRESH_COOKIE = "sb-refresh-token";

function emailAllowed(email: string | null): boolean {
  if (ADMIN_EMAILS.length === 0) return true;
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

async function verifyAccessToken(token: string): Promise<{ email: string | null } | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const user = await res.json();
    return { email: user?.email ?? null };
  } catch {
    return null;
  }
}

async function refreshSession(
  refreshToken: string,
): Promise<{ access_token: string; refresh_token: string; email: string | null } | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.access_token || !data?.refresh_token) return null;
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      email: data?.user?.email ?? null,
    };
  } catch {
    return null;
  }
}

function applySession(res: NextResponse, accessToken: string, refreshToken: string) {
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour — matches Supabase access-token lifetime
  });
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

function clearSession(res: NextResponse) {
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The auth endpoints must stay reachable without a session.
  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  const isApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/admin/login";

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  let session: { email: string | null } | null = null;
  let renewed: { access_token: string; refresh_token: string } | null = null;

  if (accessToken) {
    session = await verifyAccessToken(accessToken);
  }
  // Access token missing/expired but we still hold a refresh token → renew.
  if (!session && refreshToken) {
    const r = await refreshSession(refreshToken);
    if (r) {
      session = { email: r.email };
      renewed = { access_token: r.access_token, refresh_token: r.refresh_token };
    }
  }

  const authed = !!session && emailAllowed(session.email);

  // Logged-in admin visiting the login page → bounce to the dashboard.
  if (isLoginPage) {
    if (authed) {
      const res = NextResponse.redirect(new URL("/admin", request.url));
      if (renewed) applySession(res, renewed.access_token, renewed.refresh_token);
      return res;
    }
    return NextResponse.next();
  }

  if (!authed) {
    if (isApi) {
      const res = NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
      clearSession(res);
      return res;
    }
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    clearSession(res);
    return res;
  }

  const res = NextResponse.next();
  if (renewed) applySession(res, renewed.access_token, renewed.refresh_token);
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
