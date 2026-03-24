# Maintenance Runbook

## Refresh feeds locally
```bash
npm install
npm run fetch:news
```

## Add a new source
1. Edit `data/sources.json`
2. Add `{ "name", "url", "type", "rss": true|false }` (`false` = tracking-only source)
3. Run `npm run fetch:news`

## Add or edit articles manually
1. Edit `data/articles.json`
2. Follow required fields in `data/article-schema.md`
3. Use real-source links only for production content

## If a feed fails
- Check the failing source in workflow logs
- Confirm URL still serves public RSS/XML
- Replace or remove source

## If deployment fails
- Confirm **Settings → Pages → Source = GitHub Actions**
- Re-run **Deploy to GitHub Pages** workflow
- Verify `npm run build` succeeds locally


## Debug empty updates
- Open the latest **Daily news update** run in Actions
- Download the `fetch-status` artifact
- Check which sources succeeded/failed and how many articles were added
- Replace consistently failing sources in `data/sources.json`

## Daily automation behavior
- The daily workflow no longer pushes directly to `main`.
- When new articles are found, it opens/updates an automation PR from `automation/daily-news-update`.
- Merge that PR when ready; deploy then runs from the normal `Deploy to GitHub Pages` workflow on `main`.

## Resolve merge conflicts on `data/articles.json`
- Prefer resolving conflicts locally (not in the GitHub web editor) because this file changes frequently from automation.
- Run:
  ```bash
  git checkout --ours data/articles.json
  git add data/articles.json
  git commit
  ```
- If you want both sides merged manually, open the file and remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) before `git add`.
