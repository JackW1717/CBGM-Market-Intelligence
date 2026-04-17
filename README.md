# CBGM Market Intelligence Dashboard

A simple Next.js dashboard that renders a cached daily news snapshot from RSS + FRED sources.

## Stack

- Next.js 14 + TypeScript
- Single ingestion script: `scripts/refresh-news.ts`
- Single datastore: `data/articles.json`
- Daily scheduler: `.github/workflows/daily-refresh.yml` (7:00 AM America/New_York)

## Source registry (single config file)

RSS sources are listed in `src/config/sources.ts` (strictly typed to `NewsCategory`), then combined with FRED sources in `src/config/source-registry.ts`.

- `name`
- `type`
- `url` or `api`
- `category`
- `enabled`
- `priority`
- `parser`
- `requiresHeaders`

## Ingestion behavior

`npm run refresh-news` does the following:

1. Loads source health (`data/source-health.json`) and validates each source (including category validity).
2. Skips invalid/disabled sources and sources with repeated failures.
3. Fetches each enabled source with per-source error handling.
4. Applies request headers when `requiresHeaders=true`.
5. Normalizes items into:

```json
{
  "id": "...",
  "title": "...",
  "source": "...",
  "url": "...",
  "publishedAt": "...",
  "category": "...",
  "summary": "...",
  "type": "article|market-data",
  "region": "global|africa|us"
}
```

6. Deduplicates by canonical URL.
7. Sorts newest first.
8. Writes `data/articles.json` **only if there is at least one valid item**.
   - If zero valid items are collected, the script keeps the prior dataset and logs a warning.


## Homepage UX

- Last-updated timestamp based on `data/articles.json` file modification time
- Market Snapshot panel for rates/market-data items
- Category filter chips + client-side search (title/source/summary)
- Source/category badges and external-link indicator on each card
- Empty-state messaging when filters return no results

## Homepage behavior

- Homepage reads from `data/articles.json` only (no live fetch each page load).
- UI shows title, source, publish time, category, region, and summary.
- Category chips + search filter the list.
- Title opens original URL in a new tab.

## Local usage

```bash
npm install
npm run refresh-news
npm run dev
```

## Environment variables

Copy:

```bash
cp .env.example .env.local
```

Optional:

- `FRED_API_KEY` (if absent, script falls back to official FRED CSV endpoint)

## Daily refresh workflow

Workflow: `.github/workflows/daily-refresh.yml`

- Hourly cron trigger
- ET time gate at hour `07`
- Runs refresh script
- Commits updated `data/articles.json` and `data/source-health.json` when changes exist

### Required GitHub setting

Set **Settings → Actions → General → Workflow permissions** to **Read and write** so Actions can push refreshed data.
