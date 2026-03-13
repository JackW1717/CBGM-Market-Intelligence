export function CategoryChart({ counts }: { counts: Record<string, number> }) {
  const max = Math.max(...Object.values(counts), 1);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 font-semibold text-navy">Market Pulse: Article Counts by Theme</h3>
      <div className="space-y-2">
        {Object.entries(counts).map(([name, value]) => (
          <div key={name}>
            <div className="mb-1 flex justify-between text-xs"><span>{name}</span><span>{value}</span></div>
            <div className="h-2 rounded bg-slate-100">
              <div className="h-2 rounded bg-slateBlue" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
