import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { CategoryChart } from '../components/CategoryChart';
import { articles, marketSnapshot, sources } from '../lib/data';
import { categories, regions } from '../lib/constants';

export function HomePage() {
  const [sortMode, setSortMode] = useState<'newest' | 'relevance' | 'featured'>('newest');

  const sorted = useMemo(() => {
    if (sortMode === 'relevance') {
      return [...articles].sort((a, b) => b.relevance_score - a.relevance_score);
    }
    if (sortMode === 'featured') {
      return [...articles].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return [...articles].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [sortMode]);

  const featured = sorted.filter((a) => a.featured).slice(0, 3);
  const latest = sorted.slice(0, 4);
  const relevant = [...articles].sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 4);

  const counts = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = articles.filter((a) => a.category.includes(cat)).length;
    return acc;
  }, {});

  const twoY = marketSnapshot.us_yield_curve.find((point) => point.tenor === '2Y')?.yield_pct ?? 0;
  const tenY = marketSnapshot.us_yield_curve.find((point) => point.tenor === '10Y')?.yield_pct ?? 0;

  if (articles.length === 0) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl bg-gradient-to-r from-navy to-slateBlue p-8 text-white">
          <h1 className="text-3xl font-bold">Our Market News</h1>
          <p className="mt-2 max-w-3xl text-slate-100">
            Real article mode is enabled. Run the Daily news update workflow once to populate the repository.
          </p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-700">
          No articles yet. In GitHub, open Actions → Daily news update → Run workflow.
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-gradient-to-r from-navy to-slateBlue p-8 text-white">
        <h1 className="text-3xl font-bold">Our Market News</h1>
        <p className="mt-2 max-w-3xl text-slate-100">
          Tracks funding activity, bond market developments, market structure, and strategic news relevant to ClearBid Global Markets.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/news" className="rounded bg-white px-4 py-2 text-sm font-semibold text-navy">Explore All News</Link>
          <span className="rounded border border-white px-4 py-2 text-sm">Track the market intelligently</span>
          <label className="ml-auto flex items-center gap-2 rounded bg-white/20 px-3 py-2 text-sm">
            Sort home by
            <select className="rounded bg-white px-2 py-1 text-navy" value={sortMode} onChange={(e) => setSortMode(e.target.value as never)}>
              <option value="newest">Newest</option>
              <option value="relevance">Most relevant</option>
              <option value="featured">Featured first</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CategoryChart counts={counts} />
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-3 font-semibold text-navy">Market Snapshot: Indices + US Yield Curve</h3>
          <p className="mb-2 text-xs text-slate-500">As of {new Date(marketSnapshot.as_of).toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {marketSnapshot.indices.map((index) => (
              <div key={index.name} className="rounded border border-slate-100 p-2">
                <div className="font-semibold">{index.name}</div>
                <div>{index.value.toLocaleString()}</div>
                <div className={index.change_pct >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{index.change_pct >= 0 ? '+' : ''}{index.change_pct}%</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs">
            <div className="mb-1 font-semibold">US Treasury Yields</div>
            <div className="flex flex-wrap gap-2">
              {marketSnapshot.us_yield_curve.map((point) => <span key={point.tenor} className="rounded bg-slate-100 px-2 py-1">{point.tenor}: {point.yield_pct}%</span>)}
            </div>
            <div className="mt-2 text-slate-600">10Y-2Y spread: {(tenY - twoY).toFixed(2)}%</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-navy">Featured Stories</h2>
        <div className="grid gap-4 md:grid-cols-3">{featured.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold text-navy">Latest Stories</h2>
        <div className="grid gap-4 md:grid-cols-2">{latest.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold text-navy">Most Relevant to CBGM</h2>
        <div className="grid gap-4 md:grid-cols-2">{relevant.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="mb-2 font-semibold">Themes</h3><div className="flex flex-wrap gap-2">{categories.map((c) => <span key={c} className="rounded bg-slate-100 px-2 py-1 text-xs">{c}</span>)}</div></div>
        <div className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="mb-2 font-semibold">Regions</h3><div className="flex flex-wrap gap-2">{regions.map((r) => <span key={r} className="rounded bg-blue-50 px-2 py-1 text-xs">{r}</span>)}</div></div>
        <div className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="mb-2 font-semibold">Sources</h3><div className="flex flex-wrap gap-2">{sources.slice(0, 8).map((s) => <span key={s.name} className="rounded bg-emerald-50 px-2 py-1 text-xs">{s.name}</span>)}</div></div>
      </section>

      <section className="rounded-lg border border-dashed border-slate-400 bg-white p-5">
        <h3 className="font-semibold text-navy">Newsletter placeholder</h3>
        <p className="text-sm text-slate-600">UI only for MVP. Connect to a mailing tool in a later phase.</p>
        <div className="mt-2 flex gap-2"><input className="w-full rounded border px-3 py-2" placeholder="name@company.com" /><button className="rounded bg-navy px-4 py-2 text-white">Notify me</button></div>
      </section>
    </div>
  );
}
