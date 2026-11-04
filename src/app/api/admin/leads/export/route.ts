import { NextResponse } from "next/server";

import { sql } from "@vercel/postgres";
import { dbReady, isDbConfigured, LeadRow } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

function csvEscape(value: unknown) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({ csv: "", filename: "leads.csv" });
  }

  await dbReady();

  const { rows } = await sql<LeadRow>`
    SELECT id, created_at, name, email, phone, service_type, message, status, source, priority, contacted_at, closed_at
    FROM leads
    ORDER BY created_at DESC
    LIMIT 5000
  `;

  const header = [
    "id",
    "created_at",
    "name",
    "email",
    "phone",
    "service_type",
    "message",
    "status",
    "source",
    "priority",
    "contacted_at",
    "closed_at"
  ];
  const lines = [header.join(",")].concat(
    rows.map((r) =>
      [
        r.id,
        r.created_at,
        r.name,
        r.email,
        r.phone,
        r.service_type,
        r.message,
        r.status,
        r.source,
        r.priority,
        r.contacted_at,
        r.closed_at
      ]
        .map(csvEscape)
        .join(",")
    )
  );

  return NextResponse.json({
    csv: lines.join("\n"),
    filename: `leads_${new Date().toISOString().slice(0, 10)}.csv`
  });
}
