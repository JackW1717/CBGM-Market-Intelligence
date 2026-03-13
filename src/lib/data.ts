import articleData from '../../data/articles.json';
import sourceData from '../../data/sources.json';
import type { Article, Source } from './types';
import { calculateRelevance } from './relevance';

export const articles: Article[] = (articleData as Article[])
  .map((article) => ({ ...article, relevance_score: calculateRelevance(article) }))
  .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

export const sources: Source[] = sourceData as Source[];
