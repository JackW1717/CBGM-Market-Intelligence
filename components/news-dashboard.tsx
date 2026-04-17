"use client";

import { useMemo, useState } from "react";
import type { NewsCategory, NewsItem } from "../types/news";
import { CATEGORIES, CATEGORY_LABELS } from "../src/config/categories";

const RECENT_LIMIT = 60;

function formatDateTime(value: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/New_York"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function buildMarketSnapshot(items: NewsItem[]): NewsItem[] {
  const priorityPatterns: RegExp[] = [
    /2Y Treasury/i,
    /10Y Treasury/i,
    /30Y Treasury/i,
    /10Y minus 2Y|10Y-2Y|spread/i,
    /S&P|Dow|Nasdaq|index/i
  ];

  const marketItems = items.filter(
    (item) =>
      item.type === "market-data" ||
      item.category === "yield-curve" ||
      item.category === "major-indices" ||
      item.category === "fixed-income"
  );

  const prioritized = priorityPatterns
    .map((pattern) => marketItems.find((item) => pattern.test(item.title)))
    .filter((item): item is NewsItem => Boolean(item));

  const seen = new Set(prioritized.map((item) => item.id));
  const remainder = marketItems.filter((item) => !seen.has(item.id));

  return [...prioritized, ...remainder].slice(0, 6);
}

export default function NewsDashboard({
  articles,
  lastUpdatedAt
}: {
  articles: NewsItem[];
  lastUpdatedAt: string | null;
}) {
  const [selectedCategories, setSelectedCategories] = useState<Set<NewsCategory>>(new Set());
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const scoped = showAll ? articles : articles.slice(0, RECENT_LIMIT);

    return scoped.filter((article) => {
      const categoryMatch =
        selectedCategories.size === 0 || selectedCategories.has(article.category);

      const query = search.trim().toLowerCase();
      const searchMatch =
        query.length === 0 ||
        article.title.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [articles, search, selectedCategories, showAll]);

  const snapshotItems = useMemo(() => buildMarketSnapshot(articles), [articles]);

  const toggleCategory = (category: NewsCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSearch("");
  };

  return (
    <main className="container">
      <header className="top">
        <div>
          <h1>Market Intelligence Dashboard</h1>
          <p>Daily cached snapshot refreshed at 7:00 AM ET from multiple sources.</p>
          <p className="updated">
            Last Updated: {lastUpdatedAt ? `${formatDateTime(lastUpdatedAt)} ET` : "Unavailable"}
          </p>
        </div>
        <div className="actions">
          <input
            type="search"
            placeholder="Search title, source, summary"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search articles"
            className="search"
          />
          <button className="secondary" onClick={clearFilters}>Clear filters</button>
        </div>
      </header>

      {snapshotItems.length > 0 ? (
        <section className="snapshot">
          <h2>Market Snapshot</h2>
          <div className="snapshotGrid">
            {snapshotItems.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="snapshotItem">
                <span className="label">{item.source}</span>
                <strong>{item.title}</strong>
                <span>{formatDateTime(item.publishedAt)}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="filters">
        {CATEGORIES.map((category) => {
          const active = selectedCategories.has(category.id);
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={active ? "chip active" : "chip"}
            >
              {category.label}
            </button>
          );
        })}
      </section>

      <div className="countRow">
        <p className="count">{filtered.length} items</p>
        <button className="linkButton" onClick={() => setShowAll((prev) => !prev)}>
          {showAll ? `Show recent ${Math.min(RECENT_LIMIT, articles.length)}` : "Show all"}
        </button>
      </div>

      <section className="cards">
        {filtered.length === 0 ? (
          <article className="card empty">
            <h3>No results found</h3>
            <p>
              No items match the current filters/search. Clear filters or adjust your search query.
            </p>
          </article>
        ) : null}

        {filtered.map((article) => (
          <article key={article.id} className="card">
            <a href={article.url} target="_blank" rel="noreferrer" className="title">
              {article.title} <span className="external">↗</span>
            </a>
            <div className="meta">
              <span className="badge source">{article.source}</span>
              <span>{formatDateTime(article.publishedAt)}</span>
              <span className="badge">{CATEGORY_LABELS[article.category]}</span>
              <span className="badge">{article.region.toUpperCase()}</span>
            </div>
            {article.summary ? <p>{article.summary}</p> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
