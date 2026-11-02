import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@vercel/postgres";

import { requireAdmin } from "@/lib/admin";
import { dbReady, isDbConfigured } from "@/lib/db";
import { getSnowContractSeason } from "@/lib/siteSettings";

const UpdateSchema = z.object({
  snowContractSeason: z.boolean()
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  const snowContractSeason = await getSnowContractSeason();
  return NextResponse.json(
    { snowContractSeason },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const json = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await dbReady();
  const snowContractSeason = parsed.data.snowContractSeason;

  await sql`
    INSERT INTO site_settings (id, snow_contract_season)
    VALUES (1, ${snowContractSeason})
    ON CONFLICT (id) DO UPDATE SET
      snow_contract_season = EXCLUDED.snow_contract_season
  `;

  revalidatePath("/", "layout");

  return NextResponse.json(
    { snowContractSeason },
    { headers: { "Cache-Control": "no-store" } }
  );
}
