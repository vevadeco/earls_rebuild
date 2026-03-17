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

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

