import { NextResponse } from "next/server";
import { z } from "zod";

import { sql } from "@vercel/postgres";
import { dbReady, isDbConfigured, LeadCommentRow } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json([], { status: 200 });
  }

  await dbReady();
  const { id } = await ctx.params;

  const { rows: leads } = await sql`SELECT id FROM leads WHERE id = ${id}`;
  if (leads.length === 0) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const { rows } = await sql<LeadCommentRow>`
    SELECT id, lead_id, body, author, created_at
    FROM lead_comments
    WHERE lead_id = ${id}
    ORDER BY created_at DESC
  `;

  return NextResponse.json(rows);
}

const CommentCreateSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  author: z.string().trim().min(1).max(80).optional()
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const json = await req.json().catch(() => null);
  const parsed = CommentCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
  }

  await dbReady();
  const { id } = await ctx.params;

  const { rows: leads } = await sql`SELECT id FROM leads WHERE id = ${id}`;
  if (leads.length === 0) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const commentId = crypto.randomUUID();
  const author = parsed.data.author || "Admin";

  await sql`
    INSERT INTO lead_comments (id, lead_id, body, author)
    VALUES (${commentId}, ${id}, ${parsed.data.body}, ${author})
  `;

  const { rows } = await sql<LeadCommentRow>`
    SELECT id, lead_id, body, author, created_at
    FROM lead_comments WHERE id = ${commentId}
  `;

  return NextResponse.json(rows[0], { status: 201 });
}
