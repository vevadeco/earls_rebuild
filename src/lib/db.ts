import { sql } from "@vercel/postgres";

let schemaReady: Promise<void> | null = null;

export function isDbConfigured() {
  return Boolean(
    process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL
  );
}

/** Run a single SQL statement, logging but never throwing on failure. */
async function trySQL(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[db] ${label} failed: ${msg}`);
  }
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

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY,
      snow_contract_season BOOLEAN NOT NULL DEFAULT FALSE
    );
  `;

  await trySQL("create invoices table", () => sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      lead_id TEXT,
      type TEXT NOT NULL DEFAULT 'invoice',
      invoice_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      due_date DATE,
      subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
      tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
      tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      total NUMERIC(10,2) NOT NULL DEFAULT 0,
      notes TEXT,
      client_name TEXT,
      client_email TEXT,
      client_phone TEXT,
      client_address TEXT,
      payment_method TEXT
    );
  `);

  await trySQL("create invoice_items table", () => sql`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
      unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
      amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);

  await trySQL("create lead_comments table", () => sql`
    CREATE TABLE IF NOT EXISTS lead_comments (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      body TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await trySQL("index leads_created_at", () => sql`CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);`);
  await trySQL("index leads_status", () => sql`CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);`);
  await trySQL("index pageviews_created_at", () => sql`CREATE INDEX IF NOT EXISTS pageviews_created_at_idx ON pageviews(created_at DESC);`);
  await trySQL("index pageviews_session_id", () => sql`CREATE INDEX IF NOT EXISTS pageviews_session_id_idx ON pageviews(session_id);`);
  await trySQL("index invoices_lead_id", () => sql`CREATE INDEX IF NOT EXISTS invoices_lead_id_idx ON invoices(lead_id);`);
  await trySQL("index invoices_status", () => sql`CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);`);
  await trySQL("index invoices_type", () => sql`CREATE INDEX IF NOT EXISTS invoices_type_idx ON invoices(type);`);
  await trySQL("index invoice_items_invoice_id", () => sql`CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON invoice_items(invoice_id);`);
  await trySQL("index lead_comments_lead_id", () => sql`CREATE INDEX IF NOT EXISTS lead_comments_lead_id_idx ON lead_comments(lead_id, created_at DESC);`);

  await trySQL("add leads.priority", () => sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';`);
  await trySQL(
    "backfill leads.priority",
    () => sql`UPDATE leads SET priority = 'medium' WHERE priority IS NULL OR TRIM(priority) = '';`
  );
  await trySQL("add leads.contacted_at", () => sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;`);
  await trySQL("add leads.closed_at", () => sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;`);
  await trySQL("add invoices.payment_method", () => sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;`);

  await trySQL("fk invoices.lead_id", () => sql`
    DO $$ BEGIN
      ALTER TABLE invoices
        ADD CONSTRAINT invoices_lead_id_fkey
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await trySQL("fk invoice_items.invoice_id", () => sql`
    DO $$ BEGIN
      ALTER TABLE invoice_items
        ADD CONSTRAINT invoice_items_invoice_id_fkey
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await trySQL("fk lead_comments.lead_id", () => sql`
    DO $$ BEGIN
      ALTER TABLE lead_comments
        ADD CONSTRAINT lead_comments_lead_id_fkey
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

export async function dbReady() {
  if (!schemaReady) {
    schemaReady = ensureSchema().catch((err) => {
      schemaReady = null;
      throw err;
    });
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
  priority: string | null;
  contacted_at: string | null;
  closed_at: string | null;
};

export type LeadCommentRow = {
  id: string;
  lead_id: string;
  body: string;
  author: string;
  created_at: string;
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

export type InvoiceRow = {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string | null;
  type: string;
  invoice_number: string;
  status: string;
  due_date: string | null;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  total: string;
  notes: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  payment_method: string | null;
};

export type InvoiceItemRow = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: string;
  unit_price: string;
  amount: string;
  sort_order: number;
};
