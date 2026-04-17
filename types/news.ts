export type NewsCategory =
  | "financial-markets"
  | "global-markets"
  | "africa-markets"
  | "venture-capital"
  | "infrastructure-finance"
  | "early-stage"
  | "ai"
  | "fixed-income"
  | "macro"
  | "major-indices"
  | "yield-curve";

export type ItemType = "article" | "market-data";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  category: NewsCategory;
  summary: string;
  type: ItemType;
  region: "global" | "africa" | "us";
}
