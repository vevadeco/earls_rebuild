import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    enabled: true,
    title: "Spring Cleanup Special - 15% OFF!",
    subtitle: "Book by March 1st to save",
    discount_text: "15% OFF",
    cta_text: "Claim Offer",
    deadline_date: "2026-03-01"
  });
}

