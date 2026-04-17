import Parser from "rss-parser";
import crypto from "crypto";
import { SOURCE_REGISTRY, type SourceConfig } from "../src/config/source-registry";
import type { NewsCategory, NewsItem } from "../types/news";
import type { SourceHealth } from "./news-store";
import { validateSourcesOrThrow } from "./validate-sources";

const parser = new Parser({ timeout: 20000 });
const MAX_ITEMS_PER_SOURCE = 20;
const MAX_CONSECUTIVE_FAILURES = 3;

export interface SourceRunResult {
  name: string;
  status: "success" | "failure" | "skipped";
  itemCount: number;
  message: string;
}

export interface CollectResult {
  items: NewsItem[];
  sourceResults: SourceRunResult[];
  totalSources: number;
}

function categoryToRegion(category: NewsCategory): NewsItem["region"] {
  if (category === "africa-markets") return "africa";
  if (["fixed-income", "yield-curve", "major-indices"].includes(category)) return "us";
  return "global";
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

function cleanSummary(value?: string): string {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280);
}

function buildHeaders(source: SourceConfig): HeadersInit {
  if (!source.requiresHeaders) return {};
  return {
    "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)"
  };
}

async function parseRssSource(source: SourceConfig): Promise<NewsItem[]> {
  const res = await fetch(source.url!, { headers: buildHeaders(source) });
  if (!res.ok) throw new Error(`Feed request failed (${res.status})`);

  const feed = await parser.parseString(await res.text());

  return (feed.items ?? []).slice(0, MAX_ITEMS_PER_SOURCE).flatMap((item) => {
    const url = canonicalizeUrl(item.link ?? "");
    if (!url.startsWith("http")) return [];

    return [
      {
        id: stableId(url),
        title: item.title?.trim() || "Untitled",
        source: source.name,
        url,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        category: source.category,
        summary: cleanSummary(item.contentSnippet || item.content || item.summary || ""),
        type: "article",
        region: categoryToRegion(source.category)
      } satisfies NewsItem
    ];
  });
}

async function fetchFredLatest(seriesId: string): Promise<{ date: string; value: number } | null> {
  const params = new URLSearchParams({ series_id: seriesId, file_type: "json", sort_order: "desc", limit: "20" });
  if (process.env.FRED_API_KEY) params.set("api_key", process.env.FRED_API_KEY);

  const apiRes = await fetch(`https://api.stlouisfed.org/fred/series/observations?${params.toString()}`);
  if (apiRes.ok) {
    const body = (await apiRes.json()) as { observations?: Array<{ date: string; value: string }> };
    for (const row of body.observations ?? []) {
      const value = Number(row.value);
      if (Number.isFinite(value)) return { date: row.date, value };
    }
  }

  const csvRes = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`);
  if (!csvRes.ok) return null;

  for (const line of (await csvRes.text()).trim().split("\n").slice(1).reverse()) {
    const [date, raw] = line.split(",");
    const value = Number(raw);
    if (date && Number.isFinite(value)) return { date, value };
  }

  return null;
}

async function parseFredSource(source: SourceConfig): Promise<NewsItem[]> {
  const seriesId = source.api?.seriesId;
  if (!seriesId) return [];

  const latest = await fetchFredLatest(seriesId);
  if (!latest) return [];

  const valueLabel = `${latest.value.toFixed(2)}%`;

  return [
    {
      id: stableId(`${seriesId}|${latest.date}`),
      title: `${source.name.replace("FRED - ", "")} updated to ${valueLabel}`,
      source: "FRED",
      url: `https://fred.stlouisfed.org/series/${seriesId}`,
      publishedAt: `${latest.date}T00:00:00.000Z`,
      category: source.category,
      summary: `Latest ${seriesId} observation: ${valueLabel} on ${latest.date}.`,
      type: "market-data",
      region: "us"
    }
  ];
}

function dedupe(items: NewsItem[]): NewsItem[] {
  const map = new Map<string, NewsItem>();
  for (const item of items) map.set(canonicalizeUrl(item.url), item);
  return Array.from(map.values()).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function collectNewsItems(sourceHealth: SourceHealth = {}): Promise<CollectResult> {
  validateSourcesOrThrow(SOURCE_REGISTRY.sources);

  const sourceResults: SourceRunResult[] = [];
  const items: NewsItem[] = [];

  const activeSources = SOURCE_REGISTRY.sources.filter((s) => s.enabled).sort((a, b) => a.priority - b.priority);

  for (const source of activeSources) {
    const previousFailures = sourceHealth[source.name]?.consecutiveFailures ?? 0;
    if (previousFailures >= MAX_CONSECUTIVE_FAILURES) {
      sourceResults.push({ name: source.name, status: "skipped", itemCount: 0, message: `skipped due to ${previousFailures} consecutive failures` });
      console.log(`[SKIP] ${source.name}: repeated failures (${previousFailures})`);
      continue;
    }

    try {
      const parsed = source.type === "fred-series" ? await parseFredSource(source) : await parseRssSource(source);
      sourceResults.push({ name: source.name, status: "success", itemCount: parsed.length, message: parsed.length === 0 ? "source returned 0 items" : "success" });
      console.log(`[OK] ${source.name}: ${parsed.length} items`);
      items.push(...parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      sourceResults.push({ name: source.name, status: "failure", itemCount: 0, message });
      console.error(`[FAIL] ${source.name}: ${message}`);
    }
  }

  return { items: dedupe(items), sourceResults, totalSources: activeSources.length };
}
