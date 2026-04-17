# CBGM Market Intelligence Dashboard

Simple, production-ready news dashboard built with Next.js. It ingests RSS + FRED market data once per day, stores normalized results in `data/articles.json`, and renders a fast filterable homepage.

## Stack and architecture

- **Frontend:** Next.js 14 + TypeScript
- **Ingestion:** single Node script (`scripts/refresh-news.ts`)
- **Storage:** single JSON cache file (`data/articles.json`)
- **Scheduler:** GitHub Actions workflow at 7:00 AM America/New_York (DST-aware gate)

This keeps the repo low-maintenance: one app, one ingestion script, one scheduled workflow.

## Source registry (centralized)

All feeds and APIs are defined in:

- `src/config/source-registry.ts`

Registry contains:

- `rssFeeds` (Reuters, TechCrunch, Crunchbase, VentureBeat, MIT, World Bank, IMF, Federal Reserve)
- `apiSources` (FRED treasury/yield curve series)
- `optionalApiSources` (Alpha Vantage placeholder)

## Normalized item schema

Every entry is saved in one format:

- `id` (deterministic)
- `type` (`article` or `market-data`)
- `title`
- `link`
- `source`
- `publishedAt`
- `categories` (array)
- `summary`

## Local setup

```bash
npm install
npm run refresh-news
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

```bash
cp .env.example .env.local
```

- `FRED_API_KEY` (optional). If missing, the script falls back to FRED CSV endpoint.

## Daily refresh schedule (7:00 AM ET)

Workflow: `.github/workflows/daily-refresh.yml`

- runs hourly (`0 * * * *`)
- checks `TZ=America/New_York` and only proceeds when hour is `07`
- runs `npm install` then `npm run refresh-news`
- commits updated `data/articles.json` back to main branch

Manual refresh is available via `workflow_dispatch`.

> **Important:** In GitHub repo settings, set **Actions → General → Workflow permissions** to **Read and write** so the workflow can push updated `data/articles.json`. If your main branch is protected, allow GitHub Actions to bypass restrictions or move to a PR-based update flow.

## How filtering works

Homepage supports:

- **category chips** (multi-select)
- **search box** (title/source/summary)

Because each item carries `categories: []`, one item can appear under multiple themes.

## Deployment (simplest)

1. Push repo to GitHub.
2. Import to Vercel.
3. Deploy with defaults.

Vercel serves cached JSON-rendered content; GitHub Actions keeps data fresh daily.

## Reliability behavior

- Ingestion never fails the whole run due to one bad source.
- Each RSS/API failure is logged per source and run continues.
- Invalid or malformed items are skipped cleanly.
