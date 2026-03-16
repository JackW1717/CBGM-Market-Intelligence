import { getRelevanceLabel } from '../lib/relevance';
import type { Article } from '../lib/types';

export function ArticleCard({ article }: { article: Article }) {
  const label = getRelevanceLabel(article.relevance_score);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>{article.source_name}</span>
        <span>{new Date(article.published_at).toLocaleDateString()}</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-navy">{article.title}</h3>
      <p className="mb-3 text-sm text-slate-700">{article.summary}</p>
      <div className="mb-3 flex flex-wrap gap-1 text-xs">
        {article.category.map((tag) => <span key={tag} className="rounded bg-slate-100 px-2 py-1">{tag}</span>)}
        {article.region.map((tag) => <span key={tag} className="rounded bg-blue-50 px-2 py-1">{tag}</span>)}
        {article.market_tags.slice(0, 3).map((tag) => <span key={tag} className="rounded bg-emerald-50 px-2 py-1">{tag}</span>)}
        {article.issuer_type.map((tag) => <span key={tag} className="rounded bg-amber-50 px-2 py-1">{tag}</span>)}
      </div>
      <div className="mb-3 text-xs font-medium text-slateBlue">
        Why it matters to CBGM: {article.cbgm_relevance_reason}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="rounded bg-navy px-2 py-1 text-white">Relevance {label} ({article.relevance_score})</span>
        {article.featured && <span className="rounded bg-amber-200 px-2 py-1 text-amber-900">Featured</span>}
        <a className="text-slateBlue underline" href={article.article_url} target="_blank" rel="noreferrer">Read source</a>
      </div>
    </article>
  );
}
