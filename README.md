# Earl's Landscaping (Lead Gen + Admin)

Next.js full-stack app deployed on Vercel.

## Features

- Public landing page with CTA form (`POST /api/leads`)
- Admin login (`/admin/login`)
- Admin leads dashboard (`/admin/leads`)

## Environment variables

Set these in Vercel (Project → Settings → Environment Variables):

- `POSTGRES_URL` (provided by Vercel Postgres / Neon integration)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `NEXTAUTH_SECRET` (used as the session signing secret; any long random string)
- `RESEND_API_KEY` (sends a notification after each new lead; if unset, the lead is still saved and the email is skipped)
- `LEAD_NOTIFY_FROM` (optional sender; defaults to `Earl's Landscaping <leads@earlslandscaping.ca>`. The domain must be verified in Resend)
- `LEAD_NOTIFY_TO` (optional comma-separated recipients; defaults to `cbixby.inv@gmail.com,sales@vevade.com`)

