import { sources } from '../lib/data';

export function SourcesPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy">Tracked Sources</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {sources.map((s) => (
          <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slateBlue">
            <h2 className="font-semibold">{s.name}</h2>
            <p className="text-sm text-slate-600">Type: {s.type.replaceAll('_', ' ')}</p>
            <p className="text-xs text-slate-500">{s.rss ? 'RSS/Public feed' : 'Public source'}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
