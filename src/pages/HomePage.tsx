import { Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { CategoryChart } from '../components/CategoryChart';
import { articles, sources } from '../lib/data';
import { categories, regions } from '../lib/constants';

export function HomePage() {
  const featured = articles.filter((a) => a.featured).slice(0, 3);
  const latest = articles.slice(0, 4);
  const relevant = [...articles].sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 4);

  const counts = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = articles.filter((a) => a.category.includes(cat)).length;
    return acc;
  }, {});

  if (articles.length === 0) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl bg-gradient-to-r from-navy to-slateBlue p-8 text-white">
          <h1 className="text-3xl font-bold">Related Market News</h1>
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
        <h1 className="text-3xl font-bold">Related Market News</h1>
        <p className="mt-2 max-w-3xl text-slate-100">
          Tracks funding activity, bond market developments, market structure, and strategic news relevant to ClearBid Global Markets.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/news" className="rounded bg-white px-4 py-2 text-sm font-semibold text-navy">Explore All News</Link>
          <span className="rounded border border-white px-4 py-2 text-sm">Track the market intelligently</span>
        </div>
      </section>

      <CategoryChart counts={counts} />

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
