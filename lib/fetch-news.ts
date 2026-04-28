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

const FRED_LABELS: Record<string, string> = {
  DGS2: "US 2Y Treasury yield",
  DGS10: "US 10Y Treasury yield",
  DGS30: "US 30Y Treasury yield",
  DGS3MO: "US 3M Treasury yield",
  T10Y2Y: "10Y-2Y spread",
  DFII10: "US 10Y TIPS yield",
  T10Y3M: "10Y-3M spread"
};

const ETF_LABELS: Record<string, string> = {
  SPY: "S&P 500 (SPY)",
  QQQ: "Nasdaq-100 (QQQ)",
  DIA: "Dow Jones (DIA)",
  IWM: "Russell 2000 (IWM)"
};

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
  return { "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)" };
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

async function fetchFredObservations(seriesId: string): Promise<Array<{ date: string; value: number }>> {
  const params = new URLSearchParams({ series_id: seriesId, file_type: "json", sort_order: "desc", limit: "30" });
  if (process.env.FRED_API_KEY) params.set("api_key", process.env.FRED_API_KEY);

  const observations: Array<{ date: string; value: number }> = [];

  const apiRes = await fetch(`https://api.stlouisfed.org/fred/series/observations?${params.toString()}`);
  if (apiRes.ok) {
    const body = (await apiRes.json()) as { observations?: Array<{ date: string; value: string }> };
    for (const row of body.observations ?? []) {
      if (row.value === ".") continue;
      const value = Number(row.value);
      if (Number.isFinite(value)) observations.push({ date: row.date, value });
      if (observations.length >= 2) break;
    }
  }

  if (observations.length > 0) return observations;

  const csvRes = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`);
  if (!csvRes.ok) return [];

  for (const line of (await csvRes.text()).trim().split("\n").slice(1).reverse()) {
    const [date, raw] = line.split(",");
    if (raw === ".") continue;
    const value = Number(raw);
    if (date && Number.isFinite(value)) observations.push({ date, value });
    if (observations.length >= 2) break;
  }

  return observations;
}

async function parseFredSource(source: SourceConfig): Promise<NewsItem[]> {
  const seriesId = source.api?.seriesId;
  if (!seriesId) return [];

  const [latest, previous] = await fetchFredObservations(seriesId);
  if (!latest) return [];

  const change = previous ? latest.value - previous.value : undefined;
  const changeText = change !== undefined ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%` : "n/a";
  const label = FRED_LABELS[seriesId] ?? source.name;

  return [
    {
      id: stableId(`${seriesId}|${latest.date}`),
      title: `${label}: ${latest.value.toFixed(2)}%`,
      source: "FRED",
      url: `https://fred.stlouisfed.org/series/${seriesId}`,
      publishedAt: `${latest.date}T00:00:00.000Z`,
      category: source.category,
      summary: `${label} is ${latest.value.toFixed(2)}% (${changeText} vs previous).`,
      type: "market-data",
      region: "us",
      symbol: seriesId,
      value: latest.value,
      change,
      changePercent: change,
      unit: "%"
    }
  ];
}

async function parseAlphaVantageSource(source: SourceConfig): Promise<NewsItem[]> {
  const symbol = source.api?.symbol;
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!symbol) return [];
  if (!apiKey) throw new Error("ALPHA_VANTAGE_API_KEY is not set");

  const params = new URLSearchParams({ function: "GLOBAL_QUOTE", symbol, apikey: apiKey });
  const res = await fetch(`https://www.alphavantage.co/query?${params.toString()}`);
  if (!res.ok) throw new Error(`Alpha Vantage request failed (${res.status})`);

  const body = (await res.json()) as {
    "Global Quote"?: {
      "05. price"?: string;
      "08. previous close"?: string;
      "09. change"?: string;
      "10. change percent"?: string;
      "07. latest trading day"?: string;
    };
    Note?: string;
    Information?: string;
  };

  if (body.Note || body.Information) throw new Error(body.Note || body.Information);

  const quote = body["Global Quote"];
  if (!quote) return [];

  const price = Number(quote["05. price"]);
  const prevClose = Number(quote["08. previous close"]);
  const change = Number(quote["09. change"]);
  const changePercent = Number((quote["10. change percent"] || "").replace("%", ""));
  const tradingDay = quote["07. latest trading day"] || new Date().toISOString().slice(0, 10);

  if (!Number.isFinite(price)) return [];

  return [
    {
      id: stableId(`${symbol}|${tradingDay}`),
      title: `${ETF_LABELS[symbol] ?? symbol}: $${price.toFixed(2)}`,
      source: "Alpha Vantage",
      url: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}`,
      publishedAt: `${tradingDay}T00:00:00.000Z`,
      category: source.category,
      summary: `${symbol} close ${Number.isFinite(prevClose) ? `$${prevClose.toFixed(2)}` : "n/a"}, change ${Number.isFinite(change) ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}` : "n/a"} (${Number.isFinite(changePercent) ? `${changePercent.toFixed(2)}%` : "n/a"}).`,
      type: "market-data",
      region: "us",
      symbol,
      value: price,
      change: Number.isFinite(change) ? change : undefined,
      changePercent: Number.isFinite(changePercent) ? changePercent : undefined,
      unit: "USD"
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
      let parsed: NewsItem[] = [];
      if (source.type === "fred-series") parsed = await parseFredSource(source);
      else if (source.type === "alpha-vantage") parsed = await parseAlphaVantageSource(source);
      else parsed = await parseRssSource(source);

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
