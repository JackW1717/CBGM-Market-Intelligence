import type { NewsCategory } from "../../types/news";

export interface RssSource {
  name: string;
  url: string;
  category: NewsCategory;
}

export const rssSources: RssSource[] = [
  { name: "Reuters Business", url: "https://feeds.reuters.com/reuters/businessNews", category: "financial-markets" },
  { name: "Reuters World", url: "https://feeds.reuters.com/reuters/worldNews", category: "global-markets" },
  { name: "Federal Reserve Press Releases", url: "https://www.federalreserve.gov/feeds/press_all.xml", category: "macro" },
  { name: "Federal Reserve Speeches", url: "https://www.federalreserve.gov/feeds/speeches.xml", category: "fixed-income" },
  { name: "ECB Press Releases", url: "https://www.ecb.europa.eu/rss/press.html", category: "macro" },
  { name: "BIS Press Releases", url: "https://www.bis.org/list/press_releases.rss", category: "macro" },
  { name: "IMF News", url: "https://www.imf.org/en/News/rss", category: "macro" },
  { name: "World Bank News", url: "https://www.worldbank.org/en/news/all/rss", category: "infrastructure-finance" },
  { name: "AllAfrica Business", url: "https://allafrica.com/tools/headlines/rdf/business/headlines.rdf", category: "africa-markets" },
  { name: "AllAfrica Investment", url: "https://allafrica.com/tools/headlines/rdf/investment/headlines.rdf", category: "africa-markets" },
  { name: "SIFMA News", url: "https://www.sifma.org/feed/", category: "fixed-income" },
  { name: "Crunchbase News", url: "https://news.crunchbase.com/feed/", category: "venture-capital" },
  { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/", category: "early-stage" },
  { name: "VentureBeat", url: "https://venturebeat.com/feed/", category: "ai" }
];
