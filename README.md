# Earl's Landscaping and Snow Removal (Lead Gen + Admin)

Next.js full-stack app deployed on Vercel. Production deploys from `main`.

## Features

- Public landing page with CTA form (`POST /api/leads`)
- Lead notification email, sent during the same request that saves the lead
- Admin login (`/admin/login`)
- Admin leads dashboard (`/admin/leads`)
- Admin-only Snow Contract Season switch on the leads dashboard

## Snow Contract Season

Visitors never see this switch. Signed-in admins turn it on or off from **Admin → Leads → Snow Season**.

1. Open `/admin/login` and sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
2. Open the **Snow Season** tab.
3. Turn **Snow Contract Season** on or off. The choice is saved immediately in Postgres (`site_settings.snow_contract_season`).

The public site reads that row on each request (`force-dynamic`, no static cache). Saving the switch calls `revalidatePath`, so the new layout is used on the next visit. No redeploy.

When the switch is **on**:

- Winter colour palette
- Hero leads with snow removal and seasonal snow contracts
- Call to action is “Get a Snow Contract Quote”
- Snow removal is ordered first in the services menu, services section, and footer
- The quote form defaults to Snow Removal
- A light snowfall effect runs, and it is hidden when the visitor has `prefers-reduced-motion`

When the switch is **off**, the landscaping layout stays as it is. Snow Removal remains available in the quote form and the services menu.

## Lead emails

`POST /api/leads` saves the lead, then **awaits** the Resend send before it responds. The notification is not deferred with `after()`. If Resend is skipped or returns an error, the response is still a success (the lead is already stored) and the function logs a line starting with `[lead-notification]`.

Search Vercel runtime logs for `[lead-notification]` or `[lead] saved`.

- `status: "sent"` means Resend accepted the message.
- `status: "skipped"` means `RESEND_API_KEY` is missing on that deployment. Add it under Production and redeploy. Vercel only gives a deployment the environment variables that existed when that deployment was created.
- `status: "failed"` means Resend was called and rejected the send. The log includes the Resend error name, status, and message.

Snow Removal is stored as `service_type` `snow-removal` and the email labels it “Snow Removal”.

## Environment variables

Set these in Vercel (Project → Settings → Environment Variables) for Production, then redeploy if you add or change them:

- `POSTGRES_URL` (provided by Vercel Postgres / Neon integration)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `NEXTAUTH_SECRET` (used as the session signing secret; any long random string)
- `RESEND_API_KEY` (required for lead emails; the `earlslandscaping.ca` domain must be verified in Resend)
- `LEAD_NOTIFY_FROM` (optional sender; defaults to `Earl's Landscaping and Snow Removal <leads@earlslandscaping.ca>`)
- `LEAD_NOTIFY_TO` (optional comma-separated recipients; defaults to `cbixby.inv@gmail.com,sales@vevade.com`)

If `LEAD_NOTIFY_FROM` is already set to the previous sender name, update that variable so the inbox shows the new business name.
