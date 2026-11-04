import { NextResponse } from "next/server";
import { z } from "zod";

import { sql } from "@vercel/postgres";
import { dbReady, isDbConfigured } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const StatusBodySchema = z.object({
  payment_method: z.enum(["cash", "etransfer"]).optional().nullable()
});

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
  const allowed = new Set(["draft", "sent", "accepted", "declined", "paid", "overdue", "cancelled"]);
  if (!allowed.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = StatusBodySchema.safeParse(json);
  const paymentMethod =
    status === "paid" && parsed.success ? parsed.data.payment_method ?? null : null;

  if (status === "paid") {
    await sql`
      UPDATE invoices
      SET status = ${status},
          payment_method = ${paymentMethod},
          updated_at = now()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE invoices
      SET status = ${status},
          payment_method = NULL,
          updated_at = now()
      WHERE id = ${id}
    `;
  }

  return NextResponse.json({ success: true });
}
