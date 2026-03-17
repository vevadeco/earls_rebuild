import { NextResponse } from "next/server";
import { z } from "zod";

import { sql } from "@vercel/postgres";
import { dbReady, isDbConfigured } from "@/lib/db";

const LeadCreateSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(5),
  service_type: z.string().trim().min(1),
  message: z.string().trim().optional(),
  source: z.string().trim().optional()
});

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: "Database not configured" },
      { status: 503 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = LeadCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid form data", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await dbReady();

  const id = crypto.randomUUID();
  const { name, email, phone, service_type, message, source } = parsed.data;

  await sql`
    INSERT INTO leads (id, name, email, phone, service_type, message, status, source)
    VALUES (
      ${id},
      ${name},
      ${email},
      ${phone},
      ${service_type},
      ${message ?? null},
      'new',
      ${source ?? "website"}
    )
  `;

  return NextResponse.json({ success: true, message: "Lead created", id }, { status: 201 });
}

