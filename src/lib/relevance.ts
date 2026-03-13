import type { Article } from './types';

const weightedKeywords: Record<string, number> = {
  'bond issuance': 12,
  'primary markets': 10,
  'debt distribution': 8,
  'fixed income technology': 9,
  'issuance infrastructure': 10,
  'market transparency': 8,
  bookbuilding: 8,
  auction: 6,
  allocation: 6,
  sovereign: 8,
  'quasi-sovereign': 7,
  'project finance': 7,
  municipal: 7,
  'emerging markets': 8,
  'cross-border financing': 9,
  tokenization: 9,
  'regulated market rails': 8,
};

export function calculateRelevance(article: Article): number {
  const haystack = [
    article.title,
    article.summary,
    article.category.join(' '),
    article.market_tags.join(' '),
    article.issuer_type.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  const score = Object.entries(weightedKeywords).reduce((acc, [keyword, weight]) => {
    return haystack.includes(keyword) ? acc + weight : acc;
  }, 35);

  return Math.min(99, score);
}

export function getRelevanceLabel(score: number): 'High' | 'Medium' | 'Monitoring' {
  if (score >= 75) return 'High';
  if (score >= 55) return 'Medium';
  return 'Monitoring';
}
