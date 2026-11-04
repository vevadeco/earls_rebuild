import { NextResponse } from "next/server";
import { z } from "zod";

import { sql } from "@vercel/postgres";
import { dbReady, isDbConfigured, LeadRow } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  await dbReady();
  const { id } = await ctx.params;
  const { rows } = await sql<LeadRow>`
    SELECT id, created_at, name, email, phone, service_type, message, status, source, priority, contacted_at, closed_at
    FROM leads WHERE id = ${id}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

const LeadPatchSchema = z.object({
  priority: z.enum(["low", "medium", "high", "urgent"]).optional()
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const json = await req.json().catch(() => null);
  const parsed = LeadPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
  }

  await dbReady();
  const { id } = await ctx.params;

  if (parsed.data.priority !== undefined) {
    await sql`UPDATE leads SET priority = ${parsed.data.priority} WHERE id = ${id}`;
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  await dbReady();
  const { id } = await ctx.params;
  await sql`DELETE FROM leads WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
