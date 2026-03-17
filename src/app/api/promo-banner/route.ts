import { NextResponse } from "next/server";

export async function GET() {
  // Default settings if DB not configured or no row exists yet
  const fallback = {
    enabled: true,
    title: "Spring Cleanup Special - 15% OFF!",
    subtitle: "Book by March 1st to save",
    discount_text: "15% OFF",
    cta_text: "Claim Offer",
    deadline_date: "2026-03-01"
  };

  const { isDbConfigured, dbReady } = await import("@/lib/db");
  if (!isDbConfigured()) return NextResponse.json(fallback);

  const { sql } = await import("@vercel/postgres");
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

