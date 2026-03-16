# Our Market News (MVP)

A free, static, GitHub Pages-ready market intelligence dashboard for ClearBid Global Markets (CBGM).

## What this MVP includes
- Institutional dashboard UI + repository views (Home, All News, Themes, Regions, Sources, About)
- Local JSON content store (no database, no paid CMS, no paid APIs)
- Real-article-first data flow (no synthetic demo records in production data)
- Daily RSS/public-feed updater via GitHub Actions
- CBGM relevance scoring and “Why it matters to CBGM” explanation on every article

## Tech stack
- Vite + React + TypeScript
- Tailwind CSS
- Static deployment on GitHub Pages

## Local development
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

## Data files you will edit most
- Articles: `data/articles.json` (real fetched + manually added records)
- Feed sources: `data/sources.json`
- Article schema: `data/article-schema.md`

## Expanding coverage (early-stage, fintech, project finance, emerging markets)
- `data/sources.json` supports both auto-ingested RSS sources (`"rss": true`) and tracking-only sources (`"rss": false`).
- Add RSS/public feeds in `data/sources.json`.
- Prioritize regulator, multilateral, and specialist publications with stable RSS endpoints.
- If you have preferred sources, add them to `data/sources.json` and run `npm run fetch:news`.

## How daily updates work
- Workflow: `.github/workflows/daily-news-update.yml`
- Runs daily at 7:00 AM EST (12:00 UTC) + manual dispatch
- Executes `npm run fetch:news`
- Pulls RSS/public feeds, sanitizes/normalizes, deduplicates
- Commits `data/articles.json` only when new items exist
- Automatically deploys the site in the same workflow when updates are committed
- If a source fails, it is skipped and the run continues
- Pushes from the daily updater bot skip `deploy.yml` to avoid duplicate/cancelled deployments; the daily workflow handles deploy in that case.

## Bootstrap real articles (first run)
1. Open **Actions** in GitHub.
2. Run **Daily news update** manually once.
3. Confirm it commits new entries in `data/articles.json`.
4. The same workflow will auto-deploy if new items were committed (no second run needed).

## GitHub Pages deployment (exact clicks)
1. Push this repo to GitHub on branch `main`.
2. Open your repo in GitHub.
3. Click **Settings**.
4. In left sidebar, click **Pages**.
5. Under **Build and deployment**, set **Source** to **GitHub Actions**.
6. Click **Actions** tab and confirm workflow **Deploy to GitHub Pages** runs after push.
7. When it finishes, return to **Settings → Pages** and open the published URL.

That’s it — no manual base-path tweaks needed (routing uses hash-based URLs for Pages reliability).

## Turn daily automation on/off
- On: keep `.github/workflows/daily-news-update.yml` enabled.
- Off: disable that workflow in **Actions** (workflow page → **Disable workflow**).

## Troubleshooting
- If deploy fails: check **Actions → Deploy to GitHub Pages** logs.
- If feed update fails: check **Actions → Daily news update** logs for source-specific skip messages.
- Fetch diagnostics: download the `fetch-status` artifact from the Daily workflow run for per-source success/failure and counts.
- If one source breaks: remove or replace that feed in `data/sources.json`.

## Cheapest future upgrades
1. Add lightweight client-side search indexing (MiniSearch/FlexSearch).
2. Add source-health report artifact in daily workflow.
3. Add GitHub Issue-form intake for manual story submissions.


## Node 24 compatibility
- Workflows use `actions/checkout@v5` and `actions/setup-node@v5`.
- Workflows set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` and run with Node 22 runtime for project commands.


## URL slug note
- Display name can be set to "Our Market News" in code/UI (already updated).
- Actual GitHub Pages URL comes from your GitHub username/repo slug; spaces are not valid in URLs.
