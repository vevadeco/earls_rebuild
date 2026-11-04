import { NextResponse } from "next/server";

import { sql } from "@vercel/postgres";
import { BUSINESS_EMAIL, BUSINESS_NAME } from "@/lib/brand";
import { dbReady, isDbConfigured, InvoiceRow, InvoiceItemRow } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import {
  estimateEmailHtml,
  invoiceEmailHtml,
  sendDocumentEmail
} from "@/lib/documentEmail";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  await dbReady();
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const overrideTo: string | undefined = body?.to;

  const { rows: invRows } = await sql<InvoiceRow>`SELECT * FROM invoices WHERE id = ${id}`;
  if (invRows.length === 0) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  const invoice = invRows[0];

  const { rows: items } = await sql<InvoiceItemRow>`
    SELECT * FROM invoice_items WHERE invoice_id = ${id} ORDER BY sort_order ASC
  `;

  const recipientEmail = overrideTo || invoice.client_email;
  if (!recipientEmail) {
    return NextResponse.json(
      { error: "No email address on file for this client. Add one first." },
      { status: 422 }
    );
  }

  const commonOpts = {
    clientName: invoice.client_name || "Valued Customer",
    total: invoice.total,
    items: items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      amount: i.amount
    })),
    taxRate: invoice.tax_rate,
    taxAmount: invoice.tax_amount,
    subtotal: invoice.subtotal,
    dueDate: invoice.due_date,
    notes: invoice.notes
  };

  const isEstimate = invoice.type === "estimate";
  const html = isEstimate
    ? estimateEmailHtml({ ...commonOpts, estimateNumber: invoice.invoice_number })
    : invoiceEmailHtml({ ...commonOpts, invoiceNumber: invoice.invoice_number });

  const subject = isEstimate
    ? `Your Estimate ${invoice.invoice_number} from ${BUSINESS_NAME}`
    : `Invoice ${invoice.invoice_number} from ${BUSINESS_NAME}`;

  const result = await sendDocumentEmail({
    to: recipientEmail,
    subject,
    html,
    replyTo: BUSINESS_EMAIL
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  if (invoice.status === "draft") {
    await sql`UPDATE invoices SET status = 'sent', updated_at = now() WHERE id = ${id}`;
  }

  return NextResponse.json({ success: true, sent_to: recipientEmail });
}
