import { regions } from '../lib/constants';
import { articles } from '../lib/data';

export function RegionsPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy">Regions</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {regions.map((r) => (
          <div key={r} className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">{r}</h2>
            <p className="mt-1 text-sm text-slate-600">{articles.filter((a) => a.region.includes(r)).length} tracked stories</p>
          </div>
        ))}
      </div>
    </div>
  );
}
