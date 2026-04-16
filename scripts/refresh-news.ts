import Parser from "rss-parser";
import crypto from "crypto";
import { FEED_SOURCES } from "../src/config/sources";
import { writeArticles } from "../lib/news-store";
import type { Article } from "../types/news";

const parser = new Parser({ timeout: 15000 });
const MAX_ARTICLES_PER_FEED = 12;

function cleanSummary(value?: string): string {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

async function pullSource(source: (typeof FEED_SOURCES)[number]): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(source.url);

    return (feed.items ?? []).slice(0, MAX_ARTICLES_PER_FEED).map((item) => {
      const link = item.link ?? "";
      const title = item.title?.trim() || "Untitled";
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
      const summary = cleanSummary(item.contentSnippet || item.content || item.summary || "");
      const id = crypto.createHash("sha1").update(`${source.category}|${link}|${title}`).digest("hex");

      return {
        id,
        title,
        link,
        publishedAt,
        category: source.category,
        source: source.name,
        summary
      };
    });
  } catch (error) {
    console.error(`Failed feed: ${source.name} (${source.url})`, error);
    return [];
  }
}

async function main() {
  const nested = await Promise.all(FEED_SOURCES.map((source) => pullSource(source)));
  const dedupedMap = new Map<string, Article>();

  for (const article of nested.flat()) {
    if (!article.link.startsWith("http")) continue;
    dedupedMap.set(article.id, article);
  }

  const articles = Array.from(dedupedMap.values()).sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  await writeArticles(articles);
  console.log(`Saved ${articles.length} articles.`);
}

main().catch((error) => {
  console.error("refresh-news failed", error);
  process.exit(1);
});
