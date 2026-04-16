export type NewsCategory =
  | "financial-markets"
  | "global-markets"
  | "africa-economy"
  | "venture-capital"
  | "infrastructure-finance"
  | "early-stage-investment"
  | "ai"
  | "fixed-income"
  | "macroeconomic"
  | "major-indices"
  | "yield-curve-rates";

export interface Article {
  id: string;
  title: string;
  source: string;
  link: string;
  publishedAt: string;
  category: NewsCategory;
  summary: string;
}
