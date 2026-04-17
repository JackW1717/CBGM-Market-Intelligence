import type { NewsCategory } from "../../types/news";

export interface FeedSource {
  name: string;
  url: string;
  category: NewsCategory;
}

export const FEED_SOURCES: FeedSource[] = [
  { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", category: "financial-markets" },
  { name: "Reuters Markets", url: "https://feeds.reuters.com/reuters/businessNews", category: "global-markets" },
  { name: "AllAfrica Business", url: "https://allafrica.com/tools/headlines/rdf/business/headlines.rdf", category: "africa-economy" },
  { name: "Crunchbase News", url: "https://news.crunchbase.com/feed/", category: "venture-capital" },
  { name: "InfraPPP World", url: "https://infrapppworld.com/rss.xml", category: "infrastructure-finance" },
  { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/", category: "early-stage-investment" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/ai/feed/", category: "ai" },
  { name: "SIFMA News", url: "https://www.sifma.org/feed/", category: "fixed-income" },
  { name: "IMF News", url: "https://www.imf.org/en/News/RSS", category: "macroeconomic" },
  { name: "S&P Global Indices", url: "https://www.spglobal.com/spdji/en/rss/rss-details.xml", category: "major-indices" },
  { name: "Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_monetary.xml", category: "yield-curve-rates" }
];
