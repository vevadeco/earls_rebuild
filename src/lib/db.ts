import { sql } from "@vercel/postgres";

let schemaReady: Promise<void> | null = null;

export function isDbConfigured() {
  return Boolean(
    process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL
  );
}

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      name TEXT,
      email TEXT,
      phone TEXT,
      service_type TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      source TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pageviews (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      session_id TEXT NOT NULL,
      page TEXT,
      referrer TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS promo_settings (
      id INTEGER PRIMARY KEY,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      title TEXT,
      subtitle TEXT,
      discount_text TEXT,
      cta_text TEXT,
      deadline_date DATE
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);`;
  await sql`CREATE INDEX IF NOT EXISTS pageviews_created_at_idx ON pageviews(created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS pageviews_session_id_idx ON pageviews(session_id);`;
}

export async function dbReady() {
  if (!schemaReady) {
    schemaReady = ensureSchema();
  }
  return schemaReady;
}

export type LeadRow = {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  service_type: string | null;
  message: string | null;
  status: string;
  source: string | null;
};

export type PromoSettingsRow = {
  id: number;
  enabled: boolean;
  title: string | null;
  subtitle: string | null;
  discount_text: string | null;
  cta_text: string | null;
  deadline_date: string | null;
};

