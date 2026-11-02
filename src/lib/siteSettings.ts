import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { sql } from "@vercel/postgres";

import { dbReady, isDbConfigured } from "@/lib/db";

function asBoolean(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

export const getSnowContractSeason = cache(async () => {
  noStore();
  if (!isDbConfigured()) return false;

  try {
    await dbReady();
    const { rows } = await sql`
      SELECT snow_contract_season
      FROM site_settings
      WHERE id = 1
    `;
    return asBoolean(rows[0]?.snow_contract_season);
  } catch (err) {
    console.error("Failed to read snow contract season:", err);
    return false;
  }
});
