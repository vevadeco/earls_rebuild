import { Resend } from "resend";

import {
  BUSINESS_EMAIL,
  BUSINESS_NAME,
  BUSINESS_PHONE_DISPLAY,
  DEFAULT_LEAD_FROM
} from "@/lib/brand";

export type DocumentLineItem = {
  description: string;
  quantity: string;
  unit_price: string;
  amount: string;
};

export type SendDocumentEmailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendDocumentEmail(
  opts: SendDocumentEmailOptions
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  const from = process.env.LEAD_NOTIFY_FROM?.trim() || DEFAULT_LEAD_FROM;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    ...(opts.replyTo ? { replyTo: opts.replyTo } : {})
  });

  if (error) {
    console.error("[document-email]", error);
    return { ok: false, error: error.message || "Failed to send email" };
  }

  return { ok: true };
}

function money(value: string | number) {
  return `$${Number(value).toFixed(2)}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function itemRows(items: DocumentLineItem[]) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(item.description)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${Number(item.quantity)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${money(item.unit_price)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${money(item.amount)}</td>
      </tr>`
    )
    .join("");
}

function documentShell(opts: {
  title: string;
  number: string;
  clientName: string;
  intro: string;
  items: DocumentLineItem[];
  taxRate: string;
  taxAmount: string;
  subtotal: string;
  total: string;
  totalLabel: string;
  dueLabel?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  paymentNote?: string | null;
}) {
  const due =
    opts.dueDate && opts.dueLabel
      ? `<p style="color:#555;font-size:14px;"><strong>${escapeHtml(opts.dueLabel)}:</strong> ${new Date(
          opts.dueDate
        ).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</p>`
      : "";

  const notes = opts.notes
    ? `<div style="background:#f9f9f7;border-left:3px solid #c9a96e;padding:12px 16px;margin:16px 0;"><p style="margin:0;color:#555;font-size:13px;">${escapeHtml(
        opts.notes
      )}</p></div>`
    : "";

  const payment = opts.paymentNote
    ? `<p style="color:#555;font-size:14px;margin-top:16px;">${escapeHtml(opts.paymentNote)}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1e2d3d;padding:32px 40px;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">${escapeHtml(opts.title)}</h1>
      <p style="color:#8fa3b1;margin:4px 0 0;font-size:14px;">${escapeHtml(opts.number)}</p>
    </div>
    <div style="padding:32px 40px;">
      <p style="margin:0 0 24px;color:#333;font-size:15px;">Hi ${escapeHtml(opts.clientName)},</p>
      <p style="margin:0 0 24px;color:#555;font-size:14px;">${escapeHtml(opts.intro)}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f5f5f0;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;">Description</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:#666;text-transform:uppercase;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows(opts.items)}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:6px 12px;color:#666;font-size:14px;text-align:right;">Subtotal</td>
          <td style="padding:6px 12px;text-align:right;font-size:14px;width:120px;">${money(opts.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;color:#666;font-size:14px;text-align:right;">Tax (${Number(opts.taxRate)}%)</td>
          <td style="padding:6px 12px;text-align:right;font-size:14px;">${money(opts.taxAmount)}</td>
        </tr>
        <tr style="background:#f5f5f0;">
          <td style="padding:10px 12px;font-weight:700;font-size:16px;text-align:right;">${escapeHtml(opts.totalLabel)}</td>
          <td style="padding:10px 12px;font-weight:700;font-size:16px;text-align:right;">${money(opts.total)}</td>
        </tr>
      </table>
      ${due}
      ${notes}
      ${payment}
      <p style="color:#555;font-size:14px;margin-top:24px;">
        If you have any questions, reply to this email or give us a call.
      </p>
    </div>
    <div style="background:#f5f5f0;padding:20px 40px;border-top:1px solid #e5e5e0;">
      <p style="margin:0;color:#888;font-size:12px;line-height:1.6;">
        <strong style="color:#555;">${escapeHtml(BUSINESS_NAME)}</strong><br>
        ${escapeHtml(BUSINESS_PHONE_DISPLAY)} &nbsp;|&nbsp; ${escapeHtml(BUSINESS_EMAIL)}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function estimateEmailHtml(opts: {
  clientName: string;
  estimateNumber: string;
  total: string;
  items: DocumentLineItem[];
  taxRate: string;
  taxAmount: string;
  subtotal: string;
  dueDate?: string | null;
  notes?: string | null;
}) {
  return documentShell({
    title: "Estimate",
    number: opts.estimateNumber,
    clientName: opts.clientName,
    intro: "Thank you for your interest. Please find your estimate below.",
    items: opts.items,
    taxRate: opts.taxRate,
    taxAmount: opts.taxAmount,
    subtotal: opts.subtotal,
    total: opts.total,
    totalLabel: "Total",
    dueLabel: "Valid Until",
    dueDate: opts.dueDate,
    notes: opts.notes
  });
}

export function invoiceEmailHtml(opts: {
  clientName: string;
  invoiceNumber: string;
  total: string;
  items: DocumentLineItem[];
  taxRate: string;
  taxAmount: string;
  subtotal: string;
  dueDate?: string | null;
  notes?: string | null;
}) {
  return documentShell({
    title: "Invoice",
    number: opts.invoiceNumber,
    clientName: opts.clientName,
    intro: "Please find your invoice below.",
    items: opts.items,
    taxRate: opts.taxRate,
    taxAmount: opts.taxAmount,
    subtotal: opts.subtotal,
    total: opts.total,
    totalLabel: "Total Due",
    dueLabel: "Due Date",
    dueDate: opts.dueDate,
    notes: opts.notes,
    paymentNote:
      "Payment can be made by e-transfer or cash. Reply to this email if you have questions about payment."
  });
}
