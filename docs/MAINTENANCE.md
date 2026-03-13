# Maintenance Runbook

## Refresh feeds locally
```bash
npm install
npm run fetch:news
```

## Add a new source
1. Edit `data/sources.json`
2. Add `{ "name", "url", "type", "rss": true }`
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
