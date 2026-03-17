import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { sql } from "@vercel/postgres";
import { dbReady, isDbConfigured } from "@/lib/db";
import { z } from "zod";

const fallback = {
  enabled: true,
  title: "Spring Cleanup Special - 15% OFF!",
  subtitle: "Book by March 1st to save",
  discount_text: "15% OFF",
  cta_text: "Claim Offer",
  deadline_date: "2026-03-01"
};

const PromoSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  discount_text: z.string().optional(),
  cta_text: z.string().optional(),
  deadline_date: z.string().optional()
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) return NextResponse.json(fallback);
  await dbReady();

  const { rows } = await sql`
    SELECT enabled, title, subtitle, discount_text, cta_text, deadline_date::text AS deadline_date
    FROM promo_settings
    WHERE id = 1
  `;
  const row = rows[0];
  if (!row) return NextResponse.json(fallback);

  return NextResponse.json({
    enabled: Boolean(row.enabled),
    title: row.title ?? fallback.title,
    subtitle: row.subtitle ?? fallback.subtitle,
    discount_text: row.discount_text ?? fallback.discount_text,
    cta_text: row.cta_text ?? fallback.cta_text,
    deadline_date: row.deadline_date ?? fallback.deadline_date
  });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  await dbReady();

  const json = await req.json().catch(() => null);
  const parsed = PromoSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const next = { ...fallback, ...parsed.data };

  await sql`
    INSERT INTO promo_settings (id, enabled, title, subtitle, discount_text, cta_text, deadline_date)
    VALUES (1, ${next.enabled}, ${next.title}, ${next.subtitle}, ${next.discount_text}, ${next.cta_text},
            ${next.deadline_date ? next.deadline_date : null})
    ON CONFLICT (id) DO UPDATE SET
      enabled = EXCLUDED.enabled,
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      discount_text = EXCLUDED.discount_text,
      cta_text = EXCLUDED.cta_text,
      deadline_date = EXCLUDED.deadline_date
  `;

  return NextResponse.json(next);
}

