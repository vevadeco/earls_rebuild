import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { sql } from "@vercel/postgres";
import { dbReady, isDbConfigured } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({
      total_leads: 0,
      leads_today: 0,
      leads_this_week: 0,
      total_page_views: 0,
      visitors_today: 0,
      visitors_this_week: 0,
      conversion_rate: 0,
      daily_stats: []
    });
  }

  await dbReady();

  const [{ rows: leadsTotal }, { rows: pageviewsTotal }] = await Promise.all([
    sql<{ count: string }>`SELECT COUNT(*)::text as count FROM leads`,
    sql<{ count: string }>`SELECT COUNT(*)::text as count FROM pageviews`
  ]);
  const total_leads = Number(leadsTotal[0]?.count || 0);
  const total_page_views = Number(pageviewsTotal[0]?.count || 0);

  const [{ rows: leadsToday }, { rows: visitorsToday }] = await Promise.all([
    sql<{ count: string }>`
      SELECT COUNT(*)::text as count
      FROM leads
      WHERE created_at >= date_trunc('day', now())
    `,
    sql<{ count: string }>`
      SELECT COUNT(DISTINCT session_id)::text as count
      FROM pageviews
      WHERE created_at >= date_trunc('day', now())
    `
  ]);
  const leads_today = Number(leadsToday[0]?.count || 0);
  const visitors_today = Number(visitorsToday[0]?.count || 0);

  const [{ rows: leadsWeek }, { rows: visitorsWeek }] = await Promise.all([
    sql<{ count: string }>`
      SELECT COUNT(*)::text as count
      FROM leads
      WHERE created_at >= (now() - interval '7 days')
    `,
    sql<{ count: string }>`
      SELECT COUNT(DISTINCT session_id)::text as count
      FROM pageviews
      WHERE created_at >= (now() - interval '7 days')
    `
  ]);
  const leads_this_week = Number(leadsWeek[0]?.count || 0);
  const visitors_this_week = Number(visitorsWeek[0]?.count || 0);

  const conversion_rate =
    total_page_views > 0 ? Math.round((total_leads / total_page_views) * 1000) / 10 : 0;

  const { rows: daily } = await sql<{ date: string; visitors: string; leads: string }>`
    WITH days AS (
      SELECT generate_series(
        date_trunc('day', now()) - interval '6 days',
        date_trunc('day', now()),
        interval '1 day'
      ) AS day
    ),
    pv AS (
      SELECT date_trunc('day', created_at) AS day,
             COUNT(DISTINCT session_id)::int AS visitors
      FROM pageviews
      WHERE created_at >= (date_trunc('day', now()) - interval '6 days')
      GROUP BY 1
    ),
    ld AS (
      SELECT date_trunc('day', created_at) AS day,
             COUNT(*)::int AS leads
      FROM leads
      WHERE created_at >= (date_trunc('day', now()) - interval '6 days')
      GROUP BY 1
    )
    SELECT
      days.day::date::text AS date,
      COALESCE(pv.visitors, 0)::text AS visitors,
      COALESCE(ld.leads, 0)::text AS leads
    FROM days
    LEFT JOIN pv ON pv.day = days.day
    LEFT JOIN ld ON ld.day = days.day
    ORDER BY days.day ASC
  `;

  const daily_stats = daily.map((d) => ({
    date: d.date,
    visitors: Number(d.visitors),
    leads: Number(d.leads)
  }));

  return NextResponse.json({
    total_leads,
    leads_today,
    leads_this_week,
    total_page_views,
    visitors_today,
    visitors_this_week,
    conversion_rate,
    daily_stats
  });
}

