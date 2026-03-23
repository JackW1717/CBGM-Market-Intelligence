export type Category =
  | 'Early-Stage Funding'
  | 'Fintech'
  | 'Market Infrastructure'
  | 'Global Bonds'
  | 'Sovereign Debt'
  | 'Municipal Bonds'
  | 'Corporate Bonds'
  | 'Project Finance'
  | 'Emerging Markets'
  | 'Regulation'
  | 'Digital Assets / Tokenization'
  | 'Fixed Income Technology';

export type Region =
  | 'Global'
  | 'United States'
  | 'United Kingdom'
  | 'Europe'
  | 'Africa'
  | 'Middle East'
  | 'Asia'
  | 'Latin America';

export interface Article {
  id: string;
  title: string;
  source_name: string;
  source_url: string;
  article_url: string;
  published_at: string;
  summary: string;
  full_excerpt_optional: string | null;
  category: Category[];
  region: Region[];
  issuer_type: string[];
  market_tags: string[];
  featured: boolean;
  relevance_score: number;
  cbgm_relevance_reason: string;
  image_url_optional: string | null;
  source_type_optional: string | null;
  fetched_at_optional: string | null;
}

export interface Source {
  name: string;
  url: string;
  type: string;
  rss: boolean;
}


export interface MarketIndexPoint {
  name: string;
  value: number;
  change_pct: number;
}

export interface YieldPoint {
  tenor: string;
  yield_pct: number;
}

export interface MarketSnapshot {
  as_of: string;
  indices: MarketIndexPoint[];
  us_yield_curve: YieldPoint[];
}
