import articleData from '../../data/articles.json';
import sourceData from '../../data/sources.json';
import marketSnapshotData from '../../data/market-snapshot.json';
import type { Article, MarketSnapshot, Source } from './types';
<<<<<<< codex/build-cbgm-market-intelligence-hub-mvp-r09kkk
=======
import type { Article, Source } from './types';
>>>>>>> main
import { calculateRelevance } from './relevance';

export const articles: Article[] = (articleData as Article[])
  .map((article) => ({ ...article, relevance_score: calculateRelevance(article) }))
  .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

export const sources: Source[] = sourceData as Source[];
