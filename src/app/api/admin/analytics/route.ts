import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  return NextResponse.json({
    pageviews: 0,
    sessions: 0,
    conversion_rate: 0
  });
}

