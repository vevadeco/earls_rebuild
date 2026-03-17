import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifySessionToken } from "@/lib/auth";

export async function requireAdmin() {
  const store = await cookies();
  const token = store.get("earls_admin")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

