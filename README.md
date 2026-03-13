# CBGM Market Intelligence Hub (MVP)

A free, static, GitHub Pages-ready market intelligence dashboard for ClearBid Global Markets (CBGM).

## What this MVP includes
- Institutional dashboard UI + repository views (Home, All News, Themes, Regions, Sources, About)
- Local JSON content store (no database, no paid CMS, no paid APIs)
- 30 clearly labeled `[DEMO]` seed articles so the site is useful immediately
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
- Articles: `data/articles.json`
- Feed sources: `data/sources.json`
- Article schema: `data/article-schema.md`

## How daily updates work
- Workflow: `.github/workflows/daily-news-update.yml`
- Runs daily + manual dispatch
- Executes `npm run fetch:news`
- Pulls RSS/public feeds, sanitizes/normalizes, deduplicates
- Commits `data/articles.json` only when new items exist
- If a source fails, it is skipped and the run continues

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
- If one source breaks: remove or replace that feed in `data/sources.json`.

## Cheapest future upgrades
1. Add lightweight client-side search indexing (MiniSearch/FlexSearch).
2. Add source-health report artifact in daily workflow.
3. Add GitHub Issue-form intake for manual story submissions.
