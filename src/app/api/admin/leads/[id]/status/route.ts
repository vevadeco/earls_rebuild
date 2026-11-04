import { NextResponse } from "next/server";

import { sql } from "@vercel/postgres";
import { dbReady, isDbConfigured } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  await dbReady();

  const { id } = await ctx.params;
  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "").trim();
  const allowed = new Set(["new", "contacted", "qualified", "converted", "won", "lost", "closed"]);
  if (!allowed.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (status === "contacted") {
    await sql`UPDATE leads SET status = ${status}, contacted_at = COALESCE(contacted_at, now()) WHERE id = ${id}`;
  } else if (status === "won" || status === "lost" || status === "closed") {
    await sql`UPDATE leads SET status = ${status}, closed_at = now() WHERE id = ${id}`;
  } else {
    await sql`UPDATE leads SET status = ${status} WHERE id = ${id}`;
  }

  return NextResponse.json({ success: true });
}
