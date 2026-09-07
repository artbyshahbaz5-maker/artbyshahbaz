import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// This route sits behind the admin auth middleware, so reaching the handler at
// all means the caller holds a valid admin session. The storefront navbar hits
// it to decide whether to show the "Dashboard" shortcut. When the visitor is
// not an admin the middleware short-circuits with a 401 before we get here.
export async function GET() {
  return NextResponse.json({ success: true, admin: true });
}
