import { NextResponse } from "next/server";

import { sql } from "@vercel/postgres";
import { dbReady, isDbConfigured } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; commentId: string }> }
) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  await dbReady();
  const { id, commentId } = await ctx.params;

  await sql`
    DELETE FROM lead_comments
    WHERE id = ${commentId} AND lead_id = ${id}
  `;

  return NextResponse.json({ success: true });
}
