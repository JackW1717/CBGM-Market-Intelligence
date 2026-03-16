import { categories } from '../lib/constants';
import { articles } from '../lib/data';

export function ThemesPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy">Themes / Categories</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c} className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">{c}</h2>
            <p className="mt-1 text-sm text-slate-600">{articles.filter((a) => a.category.includes(c)).length} tracked stories</p>
          </div>
        ))}
      </div>
    </div>
  );
}
