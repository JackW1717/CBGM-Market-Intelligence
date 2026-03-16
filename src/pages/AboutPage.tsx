export function AboutPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-navy">About</h1>
      <p className="text-slate-700">Our Market News is a static, no-cost MVP repository for debt and capital markets intelligence.</p>
      <p className="text-slate-700">CBGM Market Intelligence Hub is a static, no-cost MVP repository for debt and capital markets intelligence.</p>
      <p className="text-slate-700">It uses local JSON content with optional daily RSS ingestion via GitHub Actions. If automation stops, the site keeps working with existing content.</p>
      <p className="text-slate-700">Audience: CBGM leadership, investors, issuers, banks, market participants, and strategic partners.</p>
    </div>
  );
}
