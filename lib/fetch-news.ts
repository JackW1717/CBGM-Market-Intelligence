import Parser from "rss-parser";
import crypto from "crypto";
import { SOURCE_REGISTRY, type FredSeriesSource, type RssFeedSource } from "../src/config/source-registry";
import type { NewsItem } from "../types/news";

const parser = new Parser({ timeout: 20000 });
const MAX_ARTICLES_PER_FEED = 20;

function cleanSummary(value?: string): string {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

function canonicalizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    const keepParams = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (!key.toLowerCase().startsWith("utm_")) keepParams.append(key, value);
    }
    url.search = keepParams.toString();
    return url.toString();
  } catch {
    return raw;
  }
}

function stableId(input: string): string {
  return crypto.createHash("sha1").update(input).digest("hex");
}

async function pullRssFeed(source: RssFeedSource): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);

    return (feed.items ?? []).slice(0, MAX_ARTICLES_PER_FEED).flatMap((item) => {
      const link = canonicalizeUrl(item.link ?? "");
      const title = item.title?.trim() || "Untitled";
      if (!link.startsWith("http")) return [];

      return [
        {
          id: stableId(link),
          type: "article",
          title,
          link,
          source: source.name,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          categories: source.categories,
          summary: cleanSummary(item.contentSnippet || item.content || item.summary || "")
        } satisfies NewsItem
      ];
    });
  } catch (error) {
    console.error(`[RSS] Failed: ${source.name} (${source.url})`, error);
    return [];
  }
}

async function fetchFredViaApi(seriesId: string, apiKey?: string): Promise<{ date: string; value: number } | null> {
  const params = new URLSearchParams({
    series_id: seriesId,
    file_type: "json",
    sort_order: "desc",
    limit: "20"
  });

  if (apiKey) params.set("api_key", apiKey);

  const response = await fetch(`https://api.stlouisfed.org/fred/series/observations?${params.toString()}`);
  if (!response.ok) return null;

  const body = (await response.json()) as { observations?: Array<{ date: string; value: string }> };
  for (const row of body.observations ?? []) {
    const value = Number(row.value);
    if (Number.isFinite(value)) return { date: row.date, value };
  }

  return null;
}

async function fetchFredViaCsv(seriesId: string): Promise<{ date: string; value: number } | null> {
  const response = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`);
  if (!response.ok) return null;

  const csv = await response.text();
  const lines = csv.trim().split("\n").slice(1).reverse();

  for (const line of lines) {
    const [date, raw] = line.split(",");
    const value = Number(raw);
    if (date && Number.isFinite(value)) return { date, value };
  }

  return null;
}

async function pullFredSeries(source: FredSeriesSource): Promise<NewsItem[]> {
  try {
    const apiKey = process.env.FRED_API_KEY;
    const latest = (await fetchFredViaApi(source.seriesId, apiKey)) || (await fetchFredViaCsv(source.seriesId));
    if (!latest) return [];

    const isSpread = source.seriesId.toUpperCase().includes("T10Y2Y");
    const valueLabel = `${latest.value.toFixed(2)}%`;
    const title = isSpread
      ? `US 10Y minus 2Y spread updated to ${valueLabel}`
      : `${source.name.replace("FRED - ", "")} updated to ${valueLabel}`;

    return [
      {
        id: stableId(`${source.seriesId}|${latest.date}`),
        type: "market-data",
        title,
        link: `https://fred.stlouisfed.org/series/${source.seriesId}`,
        source: "FRED",
        publishedAt: `${latest.date}T00:00:00.000Z`,
        categories: source.categories,
        summary: `Latest ${source.seriesId} observation: ${valueLabel} on ${latest.date}.`
      }
    ];
  } catch (error) {
    console.error(`[FRED] Failed: ${source.name} (${source.seriesId})`, error);
    return [];
  }
}

function dedupe(items: NewsItem[]): NewsItem[] {
  const map = new Map<string, NewsItem>();
  for (const item of items) {
    const key = item.type === "market-data" ? item.id : canonicalizeUrl(item.link);
    map.set(key, item);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function collectNewsItems(): Promise<NewsItem[]> {
  const rssResults = await Promise.all(SOURCE_REGISTRY.rssFeeds.map((source) => pullRssFeed(source)));
  const fredResults = await Promise.all(SOURCE_REGISTRY.apiSources.map((source) => pullFredSeries(source)));
  return dedupe([...rssResults.flat(), ...fredResults.flat()]);
}
