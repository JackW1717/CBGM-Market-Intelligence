import type { NewsCategory } from "../../types/news";

export type SourceType = "rss" | "rss_or_autodiscover" | "fred-series";
export type SourceParser = "rss" | "autodiscover-rss" | "fred-json";

export interface SourceConfig {
  name: string;
  type: SourceType;
  url?: string;
  api?: {
    seriesId: string;
  };
  categories: NewsCategory[];
  enabled: boolean;
  priority: number;
  parser: SourceParser;
  requiresHeaders: boolean;
}

export const SOURCE_REGISTRY: { sources: SourceConfig[] } = {
  sources: [
    {
      name: "TechCrunch Main Feed",
      type: "rss",
      url: "https://techcrunch.com/feed/",
      categories: ["venture-capital", "early-stage", "ai"],
      enabled: true,
      priority: 1,
      parser: "rss",
      requiresHeaders: true
    },
    {
      name: "Crunchbase News",
      type: "rss",
      url: "https://news.crunchbase.com/feed/",
      categories: ["venture-capital", "early-stage"],
      enabled: true,
      priority: 1,
      parser: "rss",
      requiresHeaders: true
    },
    {
      name: "VentureBeat Main",
      type: "rss_or_autodiscover",
      url: "https://venturebeat.com/",
      categories: ["ai", "venture-capital", "early-stage"],
      enabled: true,
      priority: 1,
      parser: "autodiscover-rss",
      requiresHeaders: true
    },
    {
      name: "MIT News AI",
      type: "rss",
      url: "https://news.mit.edu/rss/topic/artificial-intelligence2",
      categories: ["ai"],
      enabled: true,
      priority: 1,
      parser: "rss",
      requiresHeaders: false
    },
    {
      name: "MIT News Research",
      type: "rss",
      url: "https://news.mit.edu/rss/research",
      categories: ["ai"],
      enabled: true,
      priority: 2,
      parser: "rss",
      requiresHeaders: false
    },
    {
      name: "Federal Reserve Press Releases",
      type: "rss",
      url: "https://www.federalreserve.gov/feeds/press_all.xml",
      categories: ["macro", "fixed-income", "yield-curve"],
      enabled: true,
      priority: 1,
      parser: "rss",
      requiresHeaders: false
    },
    {
      name: "IMF News",
      type: "rss",
      url: "https://www.imf.org/en/News/rss",
      categories: ["macro", "global-markets", "fixed-income"],
      enabled: true,
      priority: 1,
      parser: "rss",
      requiresHeaders: false
    },
    {
      name: "World Bank News",
      type: "rss",
      url: "https://www.worldbank.org/en/news/all/rss",
      categories: ["infrastructure-finance", "africa-markets", "macro"],
      enabled: true,
      priority: 1,
      parser: "rss",
      requiresHeaders: false
    },
    {
      name: "Reuters Business",
      type: "rss",
      url: "https://feeds.reuters.com/reuters/businessNews",
      categories: ["financial-markets", "global-markets", "macro"],
      enabled: true,
      priority: 1,
      parser: "rss",
      requiresHeaders: true
    },
    {
      name: "FRED - 2Y Treasury",
      type: "fred-series",
      api: { seriesId: "DGS2" },
      categories: ["yield-curve", "fixed-income", "major-indices"],
      enabled: true,
      priority: 1,
      parser: "fred-json",
      requiresHeaders: false
    },
    {
      name: "FRED - 10Y Treasury",
      type: "fred-series",
      api: { seriesId: "DGS10" },
      categories: ["yield-curve", "fixed-income", "major-indices"],
      enabled: true,
      priority: 1,
      parser: "fred-json",
      requiresHeaders: false
    },
    {
      name: "FRED - 10Y minus 2Y",
      type: "fred-series",
      api: { seriesId: "T10Y2Y" },
      categories: ["yield-curve", "macro", "fixed-income"],
      enabled: true,
      priority: 1,
      parser: "fred-json",
      requiresHeaders: false
    }
  ]
};
