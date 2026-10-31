import { Resend } from "resend";

import { env } from "@/lib/env";

const DEFAULT_FROM = "Earl's Landscaping <leads@earlslandscaping.ca>";
const DEFAULT_TO = ["cbixby.inv@gmail.com", "sales@vevade.com"];

const SERVICE_LABELS: Record<string, string> = {
  "lawn-care": "Lawn Care & Maintenance",
  "garden-planting": "Garden Planting",
  hardscaping: "Hardscaping (Patios, Walkways)",
  "full-service": "Full Landscaping Service"
};

export type NewLeadNotice = {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message?: string | null;
  submittedAt: Date;
};

function configuredFrom() {
  const value = env.LEAD_NOTIFY_FROM?.trim();
  return value || DEFAULT_FROM;
}

function configuredTo() {
  const raw = env.LEAD_NOTIFY_TO?.trim();
  if (!raw) return DEFAULT_TO;
  const recipients = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return recipients.length > 0 ? recipients : DEFAULT_TO;
}

function serviceLabel(serviceType: string) {
  return SERVICE_LABELS[serviceType] || serviceType;
}

function formatSubmittedAt(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(date);
}

function oneLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function messageText(message?: string | null) {
  const value = message?.trim();
  return value ? value : null;
}

function buildContent(lead: NewLeadNotice) {
  const service = serviceLabel(lead.serviceType);
  const submitted = formatSubmittedAt(lead.submittedAt);
  const note = messageText(lead.message);
  const subject = `New lead: ${oneLine(lead.name)} – ${oneLine(service)}`.slice(0, 200);

  const rows: Array<{ label: string; text: string; html: string }> = [
    { label: "Name", text: lead.name, html: escapeHtml(lead.name) },
    {
      label: "Email",
      text: lead.email,
      html: `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>`
    },
    {
      label: "Phone",
      text: lead.phone,
      html: phoneHtml(lead.phone)
    },
    { label: "Service", text: service, html: escapeHtml(service) },
    { label: "Submitted", text: submitted, html: escapeHtml(submitted) }
  ];

  if (note) {
    rows.splice(4, 0, {
      label: "Message",
      text: note,
      html: escapeHtml(note).replace(/\r\n|\r|\n/g, "<br>")
    });
  }

  const text = [
    "New quote request",
    "",
    "Someone submitted the quote form on the Earl's Landscaping website.",
    "",
    ...rows.map((row) => `${row.label}: ${row.text}`),
    "",
    "Reply to this email to reach the lead directly."
  ].join("\n");

  const htmlRows = rows
    .map(
      (row) => `<tr>
        <th scope="row" align="left" style="padding:8px 16px 8px 0;vertical-align:top;color:#333333;font-weight:600;white-space:nowrap">${escapeHtml(row.label)}</th>
        <td style="padding:8px 0;vertical-align:top;color:#1a1a1a">${row.html}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:24px;background:#f6f7f4;color:#1a1a1a;font-family:Arial,Helvetica,sans-serif">
    <div lang="en" dir="ltr" style="max-width:560px;margin:0 auto;background:#ffffff;padding:24px;border:1px solid #e4e4e0">
      <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;color:#1a1a1a">New quote request</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#1a1a1a">Someone submitted the quote form on the Earl's Landscaping website.</p>
      <table style="border-collapse:collapse;width:100%;font-size:15px;line-height:1.5">
        <tbody>
          ${htmlRows}
        </tbody>
      </table>
      <p style="margin:20px 0 0;font-size:14px;line-height:1.5;color:#333333">Reply to this email to reach the lead directly.</p>
    </div>
  </body>
</html>`;

  return { subject, html, text };
}

function phoneHtml(phone: string) {
  const dial = phone.replace(/[^\d+]/g, "");
  const safe = escapeHtml(phone);
  if (dial.replace("+", "").length < 5) return safe;
  return `<a href="tel:${escapeHtml(dial)}">${safe}</a>`;
}

export async function notifyNewLead(lead: NewLeadNotice) {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(`Skipping lead notification for ${lead.id}: RESEND_API_KEY is not set`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { subject, html, text } = buildContent(lead);
    const { data, error } = await resend.emails.send(
      {
        from: configuredFrom(),
        to: configuredTo(),
        replyTo: lead.email,
        subject,
        html,
        text
      },
      { idempotencyKey: `lead-notification/${lead.id}` }
    );

    if (error) {
      console.error(`Failed to send lead notification for ${lead.id}:`, error.message);
      return;
    }

    console.info(`Sent lead notification ${data?.id ?? ""} for lead ${lead.id}`);
  } catch (err) {
    console.error(`Failed to send lead notification for ${lead.id}:`, err);
  }
}
