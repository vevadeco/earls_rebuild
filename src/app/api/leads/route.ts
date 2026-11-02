import { NextResponse } from "next/server";
import { z } from "zod";

import { sql } from "@vercel/postgres";
import { dbReady, isDbConfigured } from "@/lib/db";
import { notifyNewLead } from "@/lib/leadNotification";
import { SERVICE_TYPES } from "@/lib/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LeadCreateSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(5),
  service_type: z.enum(SERVICE_TYPES),
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
  const submittedAt = new Date();
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

  console.info(`[lead] saved id=${id} service=${service_type}`);

  // Await the email in this request. after() can return 201 and then never call Resend.
  await notifyNewLead({
    id,
    name,
    email,
    phone,
    serviceType: service_type,
    message,
    submittedAt
  });

  return NextResponse.json({ success: true, message: "Lead created", id }, { status: 201 });
}
