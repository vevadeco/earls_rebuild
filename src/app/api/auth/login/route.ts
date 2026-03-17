import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { setAdminSessionCookie } from "@/lib/auth";

const BodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }

  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: false, message: "Server misconfigured: set ADMIN_USERNAME and ADMIN_PASSWORD" },
      { status: 500 }
    );
  }
  if (!env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
    return NextResponse.json(
      { success: false, message: "Server misconfigured: set NEXTAUTH_SECRET (or AUTH_SECRET)" },
      { status: 500 }
    );
  }

  const { username, password } = parsed.data;
  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  }

  await setAdminSessionCookie(username);
  return NextResponse.json({ success: true });
}

