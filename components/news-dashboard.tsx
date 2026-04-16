"use client";

import { useMemo, useState } from "react";
import type { Article, NewsCategory } from "../types/news";
import { CATEGORIES, CATEGORY_LABELS } from "../src/config/categories";

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

export default function NewsDashboard({ articles }: { articles: Article[] }) {
  const [selectedCategories, setSelectedCategories] = useState<Set<NewsCategory>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return articles.filter((article) => {
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
  }, [articles, search, selectedCategories]);

  const toggleCategory = (category: NewsCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <main className="container">
      <header className="top">
        <div>
          <h1>Market Intelligence Dashboard</h1>
          <p>Fresh news snapshot across macro, markets, AI, and investment themes.</p>
        </div>
        <input
          type="search"
          placeholder="Search headlines, sources, summaries"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search articles"
          className="search"
        />
      </header>

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

      <p className="count">Showing {filtered.length} of {articles.length} articles</p>

      <section className="cards">
        {filtered.map((article) => (
          <article key={article.id} className="card">
            <a href={article.link} target="_blank" rel="noreferrer" className="title">
              {article.title}
            </a>
            <div className="meta">
              <span>{article.source}</span>
              <span>{formatDateTime(article.publishedAt)}</span>
              <span className="tag">{CATEGORY_LABELS[article.category]}</span>
            </div>
            {article.summary ? <p>{article.summary}</p> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
