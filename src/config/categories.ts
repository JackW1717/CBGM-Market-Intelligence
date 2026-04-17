import type { NewsCategory } from "../../types/news";

export const CATEGORIES: Array<{ id: NewsCategory; label: string }> = [
  { id: "financial-markets", label: "Financial Markets" },
  { id: "global-markets", label: "Global Markets" },
  { id: "africa-markets", label: "Africa Markets" },
  { id: "venture-capital", label: "Venture Capital" },
  { id: "infrastructure-finance", label: "Infrastructure Finance" },
  { id: "early-stage", label: "Early Stage" },
  { id: "ai", label: "AI" },
  { id: "fixed-income", label: "Fixed Income" },
  { id: "macro", label: "Macroeconomic" },
  { id: "major-indices", label: "Major Indices" },
  { id: "yield-curve", label: "Yield Curve / Rates" }
];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label])
) as Record<NewsCategory, string>;
