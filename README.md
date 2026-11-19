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

## Cron protection

The `/api/cron/collect` and `/api/cron/notify` routes require
`CRON_SECRET`. Set `CRON_SECRET` in the environment and send it as:

```text
Authorization: Bearer <CRON_SECRET>
```

## Roadmap

- Real tender ingestion from authorized government sources
- Email delivery for matching tenders and deadline reminders
- Authentication and individual company accounts
