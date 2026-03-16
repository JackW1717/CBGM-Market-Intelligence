# Feature Checklist (Requested Enhancements)

This file maps each requested enhancement to where it exists in code.

## Implemented

- Home page sorting options (Newest / Most relevant / Featured first)
  - `src/pages/HomePage.tsx`
- Multi-theme selection in All News filters
  - `src/components/FilterBar.tsx`
  - `src/pages/AllNewsPage.tsx`
- Site display name changed to **Our Market News**
  - `index.html`
  - `src/components/Layout.tsx`
  - `src/pages/HomePage.tsx`
  - `src/pages/AboutPage.tsx`
- Article title clickable to original source
  - `src/components/ArticleCard.tsx`
- Summary cleanup / clamp (removes noisy long preview lines)
  - `src/components/ArticleCard.tsx`
  - `src/styles/index.css`
- Daily update schedule set to 7:00 AM EST (12:00 UTC)
  - `.github/workflows/daily-news-update.yml`
- Market snapshot section (indices + US yield curve)
  - `data/market-snapshot.json`
  - `src/lib/types.ts`
  - `src/lib/data.ts`
  - `src/pages/HomePage.tsx`

## Note on URL naming

GitHub Pages URL is based on GitHub username/repo slug and cannot include spaces.
Use code/UI branding for display name (`Our Market News`), and rename the GitHub repo separately if you want a different slug.
