import type { NewsCategory } from "../../types/news";
import { rssSources } from "./sources";

export type SourceType = "rss" | "fred-series";
export type SourceParser = "rss" | "fred-json";

export interface SourceConfig {
  name: string;
  type: SourceType;
  url?: string;
  api?: {
    seriesId: string;
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
    {
      name: "FRED - 2Y Treasury",
      type: "fred-series",
      api: { seriesId: "DGS2" },
      category: "yield-curve",
      enabled: true,
      priority: 1,
      parser: "fred-json",
      requiresHeaders: false
    },
    {
      name: "FRED - 10Y Treasury",
      type: "fred-series",
      api: { seriesId: "DGS10" },
      category: "yield-curve",
      enabled: true,
      priority: 1,
      parser: "fred-json",
      requiresHeaders: false
    },
    {
      name: "FRED - 10Y minus 2Y",
      type: "fred-series",
      api: { seriesId: "T10Y2Y" },
      category: "yield-curve",
      enabled: true,
      priority: 1,
      parser: "fred-json",
      requiresHeaders: false
    }
  ]
};
