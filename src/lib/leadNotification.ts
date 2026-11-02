import { Resend } from "resend";

import { BUSINESS_NAME, DEFAULT_LEAD_FROM } from "@/lib/brand";
import { serviceLabel } from "@/lib/services";

const DEFAULT_TO = ["cbixby.inv@gmail.com", "sales@vevade.com"];

export type NewLeadNotice = {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message?: string | null;
  submittedAt: Date;
};

export type LeadNotificationResult = {
  status: "sent" | "skipped" | "failed";
  leadId: string;
  detail: string;
  resendId?: string;
  apiKeyPresent: boolean;
  fromConfigured: boolean;
  toConfigured: boolean;
};

function configuredFrom() {
  const value = process.env.LEAD_NOTIFY_FROM?.trim();
  return value || DEFAULT_LEAD_FROM;
}

function configuredTo() {
  const raw = process.env.LEAD_NOTIFY_TO?.trim();
  if (!raw) return DEFAULT_TO;
  const recipients = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return recipients.length > 0 ? recipients : DEFAULT_TO;
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
  const intro = `Someone submitted the quote form on the ${BUSINESS_NAME} website.`;

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
    intro,
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
      <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#1a1a1a">${escapeHtml(intro)}</p>
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

function errorDetail(error: unknown) {
  if (!error || typeof error !== "object") return String(error);
  const record = error as { name?: string; message?: string; statusCode?: number | null };
  const name = record.name || "resend_error";
  const status = record.statusCode ?? "none";
  const message = record.message || "Unknown Resend error";
  return `${name} (${status}): ${message}`;
}

function logResult(result: LeadNotificationResult) {
  const line = `[lead-notification] ${JSON.stringify(result)}`;
  if (result.status === "sent") console.info(line);
  else console.error(line);
}

/**
 * Sends the owner notification before the API response is finished.
 * `after()` was not used: a missing key or a dropped callback never called Resend,
 * and the failure was easy to miss in the request log.
 */
export async function notifyNewLead(lead: NewLeadNotice): Promise<LeadNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  const fromConfigured = Boolean(process.env.LEAD_NOTIFY_FROM?.trim());
  const toConfigured = Boolean(process.env.LEAD_NOTIFY_TO?.trim());
  const base = {
    leadId: lead.id,
    apiKeyPresent: Boolean(apiKey),
    fromConfigured,
    toConfigured
  };

  if (!apiKey) {
    const result: LeadNotificationResult = {
      ...base,
      status: "skipped",
      detail:
        "RESEND_API_KEY is not set in this deployment. The lead was saved, but Resend was not called. Add the key in Vercel Production and redeploy."
    };
    logResult(result);
    return result;
  }

  try {
    const resend = new Resend(apiKey);
    const { subject, html, text } = buildContent(lead);
    const from = configuredFrom();
    const to = configuredTo();
    const { data, error } = await resend.emails.send(
      {
        from,
        to,
        replyTo: lead.email,
        subject,
        html,
        text
      },
      { idempotencyKey: `lead-notification/${lead.id}` }
    );

    if (error) {
      const result: LeadNotificationResult = {
        ...base,
        status: "failed",
        detail: errorDetail(error)
      };
      logResult(result);
      return result;
    }

    const result: LeadNotificationResult = {
      ...base,
      status: "sent",
      detail: "Resend accepted the lead notification",
      resendId: data?.id
    };
    logResult(result);
    return result;
  } catch (err) {
    const result: LeadNotificationResult = {
      ...base,
      status: "failed",
      detail: err instanceof Error ? `${err.name}: ${err.message}` : errorDetail(err)
    };
    logResult(result);
    return result;
  }
}
