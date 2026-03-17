import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";

let promo = {
  enabled: true,
  title: "Spring Cleanup Special - 15% OFF!",
  subtitle: "Book by March 1st to save",
  discount_text: "15% OFF",
  cta_text: "Claim Offer",
  deadline_date: "2026-03-01"
};

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  return NextResponse.json(promo);
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const json = await req.json().catch(() => null);
  if (json && typeof json === "object") {
    promo = { ...promo, ...json };
  }
  return NextResponse.json(promo);
}

