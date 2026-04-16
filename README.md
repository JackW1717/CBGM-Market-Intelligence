# CBGM Market Intelligence Dashboard

A simple, production-ready Next.js dashboard that shows daily market and macro news from multiple RSS sources.

## Why this stack

- **Next.js + TypeScript** for a clean frontend and easy deployment.
- **RSS ingestion script** (`scripts/refresh-news.ts`) keeps dependencies light and avoids backend complexity.
- **Static JSON storage** (`data/articles.json`) makes the homepage fast and avoids live API calls on page load.
- **GitHub Actions scheduler** handles automated daily refresh and commits updated data to the repo.

## Categories covered

- Financial markets
- Global markets
- Africa economy and market news
- Venture capital news
- Infrastructure finance news
- Early-stage investment news
- AI news
- Fixed income news
- Macroeconomic news
- Major indices
- Yield curve / interest rate news

## Project structure

```text
app/                    Next.js pages and styling
components/             Client dashboard component
data/articles.json      Cached news data rendered by homepage
lib/news-store.ts       Read/write helper for news data
scripts/refresh-news.ts Daily ingestion script
src/config/sources.ts   Feed list (easy to edit)
src/config/categories.ts Categories and labels
.github/workflows/      Daily GitHub Actions scheduler
```

## Local setup

1. Install Node.js 18.18+ (Node 20 recommended).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Pull news data once:
   ```bash
   npm run refresh-news
   ```
4. Start locally:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## Environment variables

Copy example env file:

```bash
cp .env.example .env.local
```

Default setup uses RSS only and does **not** require API keys.

## Daily refresh at 7:00 AM Eastern

- Workflow file: `.github/workflows/daily-refresh.yml`
- Trigger: hourly cron (`0 * * * *`)
- Guard: checks `TZ=America/New_York date +%H` and only runs refresh when hour is `07`
- This keeps execution aligned with **7:00 AM ET**, including DST transitions, because the check is done in `America/New_York` timezone.
- Workflow commits `data/articles.json` when content changes.

Manual refresh is available with **Run workflow** (`workflow_dispatch`) in GitHub Actions.

## How to edit sources

Update feed definitions in:

- `src/config/sources.ts`

Each source has `name`, `url`, and `category`. Keep categories aligned with `src/config/categories.ts`.

## Deployment (simplest path)

### Recommended: Vercel + GitHub

1. Push this repo to GitHub.
2. Import the repository in Vercel.
3. Use defaults (`npm run build`, Next.js autodetected).
4. Deploy.

Because data is refreshed and committed by GitHub Actions, Vercel serves pre-fetched data quickly without runtime API calls.

## GitHub connection instructions

If this is a new local repository:

```bash
git init
git add .
git commit -m "feat: initial market intelligence dashboard"
git branch -M main
git remote add origin https://github.com/<your-org-or-user>/<repo-name>.git
git push -u origin main
```

After push:

- Enable Actions for the repository.
- Confirm `.github/workflows/daily-refresh.yml` is present.
- Optionally run the workflow manually once to seed `data/articles.json`.

## Notes

- Some RSS feeds can occasionally throttle or fail; script logs and continues.
- Titles always link to original publisher pages.
- Homepage supports category multi-select filtering and text search.
