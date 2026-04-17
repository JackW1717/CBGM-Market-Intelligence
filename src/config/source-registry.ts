import type { NewsCategory } from "../../types/news";

export interface RssFeedSource {
  name: string;
  url: string;
  categories: NewsCategory[];
}

export interface FredSeriesSource {
  name: string;
  type: "fred-series";
  seriesId: string;
  categories: NewsCategory[];
}

export interface AlphaVantageSource {
  name: string;
  type: "alpha-vantage";
  symbols: string[];
  categories: NewsCategory[];
}

export const SOURCE_REGISTRY: {
  rssFeeds: RssFeedSource[];
  apiSources: FredSeriesSource[];
  optionalApiSources: AlphaVantageSource[];
} = {
  rssFeeds: [
    {
      name: "Reuters Business",
      url: "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
      categories: ["financial-markets", "global-markets", "macro"]
    },
    {
      name: "Reuters World",
      url: "https://www.reutersagency.com/feed/?best-topics=world&post_type=best",
      categories: ["global-markets", "macro"]
    },
    {
      name: "Reuters Africa",
      url: "https://www.reutersagency.com/feed/?best-regions=africa&post_type=best",
      categories: ["africa-markets", "global-markets", "macro"]
    },
    {
      name: "TechCrunch",
      url: "https://techcrunch.com/feed/",
      categories: ["venture-capital", "early-stage", "ai"]
    },
    {
      name: "Crunchbase News",
      url: "https://news.crunchbase.com/feed/",
      categories: ["venture-capital", "early-stage"]
    },
    {
      name: "VentureBeat",
      url: "https://venturebeat.com/feed/",
      categories: ["ai", "venture-capital", "early-stage"]
    },
    {
      name: "MIT News - AI / Research",
      url: "https://news.mit.edu/rss/topic/artificial-intelligence2",
      categories: ["ai"]
    },
    {
      name: "MIT News - Research",
      url: "https://news.mit.edu/rss/research",
      categories: ["ai"]
    },
    {
      name: "World Bank News",
      url: "https://www.worldbank.org/en/news/all/rss",
      categories: ["infrastructure-finance", "macro", "africa-markets"]
    },
    {
      name: "IMF News",
      url: "https://www.imf.org/en/News/rss",
      categories: ["macro", "global-markets", "fixed-income"]
    },
    {
      name: "Federal Reserve Press Releases",
      url: "https://www.federalreserve.gov/feeds/press_all.xml",
      categories: ["macro", "fixed-income", "yield-curve"]
    }
  ],
  apiSources: [
    {
      name: "FRED - 2Y Treasury",
      type: "fred-series",
      seriesId: "DGS2",
      categories: ["yield-curve", "fixed-income", "major-indices"]
    },
    {
      name: "FRED - 10Y Treasury",
      type: "fred-series",
      seriesId: "DGS10",
      categories: ["yield-curve", "fixed-income", "major-indices"]
    },
    {
      name: "FRED - 30Y Treasury",
      type: "fred-series",
      seriesId: "DGS30",
      categories: ["yield-curve", "fixed-income", "major-indices"]
    },
    {
      name: "FRED - 3M Treasury",
      type: "fred-series",
      seriesId: "DGS3MO",
      categories: ["yield-curve", "fixed-income"]
    },
    {
      name: "FRED - 10Y minus 2Y",
      type: "fred-series",
      seriesId: "T10Y2Y",
      categories: ["yield-curve", "macro", "fixed-income"]
    }
  ],
  optionalApiSources: [
    {
      name: "Alpha Vantage Global Quote / Market Data",
      type: "alpha-vantage",
      symbols: ["SPY", "QQQ", "DIA"],
      categories: ["major-indices", "financial-markets"]
    }
  ]
};
