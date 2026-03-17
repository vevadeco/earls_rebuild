import crypto from "crypto";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

const COOKIE_NAME = "earls_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

type SessionPayload = {
  sub: string;
  exp: number;
};

function getSecret() {
  const secret = env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";
  if (!secret) throw new Error("Missing NEXTAUTH_SECRET (or AUTH_SECRET)");
  return secret;
}

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function b64urlJson(obj: unknown) {
  return b64url(JSON.stringify(obj));
}

function sign(data: string, secret: string) {
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  return b64url(sig);
}

export function createSessionToken(username: string) {
  const payload: SessionPayload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS
  };
  const encodedPayload = b64urlJson(payload);
  const secret = getSecret();
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  const secret = getSecret();
  const expected = sign(encodedPayload, secret);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload.replaceAll("-", "+").replaceAll("_", "/"), "base64").toString(
        "utf8"
      )
    ) as SessionPayload;
    if (!payload?.sub || !payload?.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setAdminSessionCookie(username: string) {
  const token = createSessionToken(username);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/"
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export async function isAdminAuthed() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return Boolean(verifySessionToken(token));
}

