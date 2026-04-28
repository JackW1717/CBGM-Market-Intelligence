import type { NewsCategory } from "../../types/news";
import { rssSources } from "./sources";

export type SourceType = "rss" | "fred-series" | "alpha-vantage";
export type SourceParser = "rss" | "fred-json" | "alpha-global-quote";

export interface SourceConfig {
  name: string;
  type: SourceType;
  url?: string;
  api?: {
    seriesId?: string;
    symbol?: string;
  };
  category: NewsCategory;
  enabled: boolean;
  priority: number;
  parser: SourceParser;
  requiresHeaders: boolean;
}

export const SOURCE_REGISTRY: { sources: SourceConfig[] } = {
  sources: [
    ...rssSources.map((source) => ({
      ...source,
      type: "rss" as const,
      enabled: true,
      priority: 1,
      parser: "rss" as const,
      requiresHeaders: true
    })),
    { name: "FRED - 2Y Treasury", type: "fred-series", api: { seriesId: "DGS2" }, category: "yield-curve", enabled: true, priority: 1, parser: "fred-json", requiresHeaders: false },
    { name: "FRED - 10Y Treasury", type: "fred-series", api: { seriesId: "DGS10" }, category: "yield-curve", enabled: true, priority: 1, parser: "fred-json", requiresHeaders: false },
    { name: "FRED - 30Y Treasury", type: "fred-series", api: { seriesId: "DGS30" }, category: "yield-curve", enabled: true, priority: 1, parser: "fred-json", requiresHeaders: false },
    { name: "FRED - 3M Treasury", type: "fred-series", api: { seriesId: "DGS3MO" }, category: "yield-curve", enabled: true, priority: 1, parser: "fred-json", requiresHeaders: false },
    { name: "FRED - 10Y minus 2Y", type: "fred-series", api: { seriesId: "T10Y2Y" }, category: "yield-curve", enabled: true, priority: 1, parser: "fred-json", requiresHeaders: false },
    { name: "FRED - 10Y TIPS", type: "fred-series", api: { seriesId: "DFII10" }, category: "yield-curve", enabled: true, priority: 2, parser: "fred-json", requiresHeaders: false },
    { name: "FRED - 10Y minus 3M", type: "fred-series", api: { seriesId: "T10Y3M" }, category: "yield-curve", enabled: true, priority: 2, parser: "fred-json", requiresHeaders: false },
    { name: "Alpha Vantage - SPY", type: "alpha-vantage", api: { symbol: "SPY" }, category: "major-indices", enabled: true, priority: 1, parser: "alpha-global-quote", requiresHeaders: false },
    { name: "Alpha Vantage - QQQ", type: "alpha-vantage", api: { symbol: "QQQ" }, category: "major-indices", enabled: true, priority: 1, parser: "alpha-global-quote", requiresHeaders: false },
    { name: "Alpha Vantage - DIA", type: "alpha-vantage", api: { symbol: "DIA" }, category: "major-indices", enabled: true, priority: 1, parser: "alpha-global-quote", requiresHeaders: false },
    { name: "Alpha Vantage - IWM", type: "alpha-vantage", api: { symbol: "IWM" }, category: "major-indices", enabled: true, priority: 2, parser: "alpha-global-quote", requiresHeaders: false }
  ]
};
