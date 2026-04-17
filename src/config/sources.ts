import type { NewsCategory } from "../../types/news";

export interface RssSource {
  name: string;
  url: string;
  category: NewsCategory;
}

export const rssSources: RssSource[] = [
  { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", category: "financial-markets" },
  { name: "MarketWatch Top Stories", url: "http://feeds.marketwatch.com/marketwatch/topstories/", category: "financial-markets" },
  { name: "CNBC World", url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", category: "global-markets" },
  { name: "CNBC Finance", url: "https://www.cnbc.com/id/10000664/device/rss/rss.html", category: "financial-markets" },
  { name: "AllAfrica Business", url: "https://allafrica.com/tools/headlines/rdf/business/headlines.rdf", category: "africa-markets" },
  { name: "AllAfrica Investment", url: "https://allafrica.com/tools/headlines/rdf/investment/headlines.rdf", category: "africa-markets" },
  { name: "Crunchbase News", url: "https://news.crunchbase.com/feed/", category: "venture-capital" },
  { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/", category: "early-stage" },
  { name: "TechCrunch Venture", url: "https://techcrunch.com/tag/venture-capital/feed/", category: "venture-capital" },
  { name: "VentureBeat", url: "https://venturebeat.com/feed/", category: "ai" },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", category: "ai" },
  { name: "Federal Reserve Press Releases", url: "https://www.federalreserve.gov/feeds/press_all.xml", category: "macro" },
  { name: "Federal Reserve Speeches", url: "https://www.federalreserve.gov/feeds/speeches.xml", category: "fixed-income" },
  { name: "IMF News", url: "https://www.imf.org/en/News/rss", category: "macro" },
  { name: "World Bank News", url: "https://www.worldbank.org/en/news/all/rss", category: "infrastructure-finance" }
];
