import { NextResponse } from "next/server";

import { z } from "zod";
import { sql } from "@vercel/postgres";

import { dbReady, isDbConfigured } from "@/lib/db";

const BodySchema = z.object({
  page: z.string().optional(),
  referrer: z.string().nullable().optional(),
  session_id: z.string().min(1)
});

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ success: true });
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  await dbReady();

  const id = crypto.randomUUID();
  const { page, referrer, session_id } = parsed.data;
  await sql`
    INSERT INTO pageviews (id, session_id, page, referrer)
    VALUES (${id}, ${session_id}, ${page ?? null}, ${referrer ?? null})
  `;

  return NextResponse.json({ success: true });
}

