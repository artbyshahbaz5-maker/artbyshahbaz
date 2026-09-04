import { NextRequest, NextResponse } from "next/server";
import { getFullSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const data = await getFullSiteData();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}
