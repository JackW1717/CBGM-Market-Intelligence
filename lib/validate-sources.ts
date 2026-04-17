import { CATEGORIES } from "../src/config/categories";
import type { SourceConfig } from "../src/config/source-registry";

const VALID_CATEGORY_SET = new Set(CATEGORIES.map((c) => c.id));

export function validateSourcesOrThrow(sources: SourceConfig[]): void {
  const errors: string[] = [];

  for (const source of sources) {
    if (!VALID_CATEGORY_SET.has(source.category)) {
      errors.push(`${source.name}: invalid category '${source.category}'`);
    }

    if (source.type === "rss" && !source.url) {
      errors.push(`${source.name}: missing RSS url`);
    }

    if (source.type === "fred-series" && !source.api?.seriesId) {
      errors.push(`${source.name}: missing FRED seriesId`);
    }

    if (source.type === "alpha-vantage" && !source.api?.symbol) {
      errors.push(`${source.name}: missing Alpha Vantage symbol`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Source registry validation failed:\n- ${errors.join("\n- ")}`);
  }
}
