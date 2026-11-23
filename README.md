# TenderMatch

TenderMatch is a tender discovery application built for Indian MSMEs. It helps
business owners find government opportunities, understand their eligibility,
identify missing requirements, and save relevant tenders.

## Features

- Company profile for industry, location, turnover, Udyam number, certificates,
  and business capabilities
- Tender search and filters
- Hard eligibility checks and tender match scoring
- Partial-match and gap analysis
- Udyam-based EMD exemption detection
- Saved tenders
- Alert preferences
- Daily tender collection and notification cron routes

## Tech stack

- Next.js 16
- React 19
- Prisma
- PostgreSQL
- Zod
- Tailwind CSS
- Vitest

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy [`.env.example`](.env.example) to `.env` and provide the required
   environment variable names with local values.

3. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Seed the database:

   ```bash
   npx prisma db seed
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

Then open `http://localhost:3000`.

## How matching works

| Type | Checks |
| --- | --- |
| Hard checks | Tender location, minimum turnover, and required certificates |
| Soft score | Industry relevance, matching capabilities, and Udyam EMD exemption |

A tender is **eligible** when every hard check passes. One failed hard check
produces a **partial** match, while multiple failures produce a
**not eligible** result.

## Live deployment

https://match-making-8td4.vercel.app/

### Vercel environment variables

In the Vercel project settings, add these variables for the Production
environment before redeploying:

```text
DATABASE_URL=<your production PostgreSQL connection string>
AUTH_SECRET=<a long random secret>
DEMO_PASSWORD=<password for the optional demo account>
CRON_SECRET=<a long random secret>
```

`AUTH_SECRET` is required by Auth.js in production. `DATABASE_URL` must point
to the PostgreSQL database that contains the applied Prisma migrations.
`DEMO_PASSWORD` is only needed when seeding or re-seeding the demo account.
`CRON_SECRET` protects both scheduled cron endpoints. The `vercel-build` script
runs `prisma migrate deploy` before building the app.

Generate a strong Auth.js secret and cron secret locally or in an environment
manager; never commit their values.

## Authentication setup

- Create accounts at `/signup`.
- Sign in at `/login`.
- Session access uses Auth.js JWT credentials authentication.
- Set `AUTH_SECRET` in every deployed environment.
- Set `DEMO_PASSWORD` before running the seed if you want to create or update
  the demo account.
- Set `CRON_SECRET` before invoking the protected cron routes.
- Signup passwords must contain at least 8 characters.

## Login rate limiting

Login attempts use persistent PostgreSQL `LoginAttempt` rows keyed by normalized
email, Vercel client IP, and the email/IP pair. Active failures receive
progressive cooldowns; successful authentication clears the email and pair
counters while retaining the IP counter to preserve distributed-attempt evidence.

On Vercel, the limiter prefers `x-vercel-forwarded-for` and, only when
`x-vercel-id` is present, the sanitized leftmost `x-forwarded-for` entry.
Arbitrary `x-forwarded-for`, `x-real-ip`, and `cf-connecting-ip` values are
ignored outside that trusted Vercel context. Missing or malformed values create
only the email-specific scope; no `unknown` IP or pair scope is shared.

The Auth.js credentials callback receives a reconstructed request, and live
end-to-end header forwarding has not been verified. If Vercel forwarding headers
are absent in that callback, IP scopes fall back to email-only protection rather
than trusting spoofable headers.

Apply the new migration explicitly before enabling production login limiting:

```bash
npx prisma migrate deploy
```

The authorized `/api/cron/collect` route performs bounded cleanup of expired
login-attempt rows (up to 500 per run). Active cooldown rows are never cleaned.

## Routes

| Route | Description |
| --- | --- |
| `/` | Public TenderMatch landing page |
| `/login` | Sign-in page |
| `/signup` | Account registration page |
| `/tenders` | Authenticated tender discovery and matching |
| `/tenders/[id]` | Authenticated tender details |
| `/profile` | Authenticated company profile |
| `/saved` | Authenticated saved tender list |
| `/alerts` | Authenticated alert preferences |
| `/api/auth/*` | Auth.js authentication handlers |
| `/api/cron/collect` | Protected tender collection job |
| `/api/cron/notify` | Protected deadline notification job |

## Re-seeding

The seed is safe to run repeatedly. It upserts tenders by `sourceUrl`, updates
the demo company if the demo user exists, and never deletes users, companies,
saved tenders or alert settings.

```bash
npx prisma migrate deploy
npx prisma db seed
```

Set `DEMO_PASSWORD` in the environment before seeding to create or refresh the
demo user. If it is not set, the seed will add or refresh tender records but skip
demo-user creation.

## Cron protection

The `/api/cron/collect` and `/api/cron/notify` routes require
`CRON_SECRET`. Set `CRON_SECRET` in the environment and send it as:

```text
Authorization: Bearer <CRON_SECRET>
```

## Roadmap

- Real tender ingestion from authorized government sources
- Email delivery for matching tenders and deadline reminders
