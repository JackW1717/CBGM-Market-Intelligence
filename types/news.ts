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
  type: ItemType;
  title: string;
  source: string;
  link: string;
  publishedAt: string;
  categories: NewsCategory[];
  summary: string;
}
