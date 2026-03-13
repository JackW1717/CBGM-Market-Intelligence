import { useMemo, useState } from 'react';
import { ArticleCard } from '../components/ArticleCard';
import { FilterBar } from '../components/FilterBar';
import { articles } from '../lib/data';

const PAGE_SIZE = 9;

export function AllNewsPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedIssuer, setSelectedIssuer] = useState('');
  const [selectedMarketTag, setSelectedMarketTag] = useState('');
  const [recencyDays, setRecencyDays] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const issuerOptions = useMemo(() => [...new Set(articles.flatMap((a) => a.issuer_type))].sort(), []);
  const marketTagOptions = useMemo(() => [...new Set(articles.flatMap((a) => a.market_tags))].sort(), []);

  const filtered = useMemo(() => {
    const now = Date.now();
    return articles.filter((a) => {
      if (selectedCategory && !a.category.includes(selectedCategory as never)) return false;
      if (selectedRegion && !a.region.includes(selectedRegion as never)) return false;
      if (selectedIssuer && !a.issuer_type.includes(selectedIssuer)) return false;
      if (selectedMarketTag && !a.market_tags.includes(selectedMarketTag)) return false;
      if (featuredOnly && !a.featured) return false;
      if (recencyDays) {
        const ageDays = (now - new Date(a.published_at).getTime()) / (1000 * 60 * 60 * 24);
        if (ageDays > Number(recencyDays)) return false;
      }
      const blob = `${a.title} ${a.summary} ${a.market_tags.join(' ')} ${a.issuer_type.join(' ')}`.toLowerCase();
      return blob.includes(query.toLowerCase());
    });
  }, [query, selectedCategory, selectedRegion, selectedIssuer, selectedMarketTag, featuredOnly, recencyDays]);

  const shown = filtered.slice(0, page * PAGE_SIZE);

  return (
    <div>
      <h1 className="mb-3 text-2xl font-bold text-navy">All News</h1>
      <FilterBar
        query={query}
        setQuery={setQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedIssuer={selectedIssuer}
        setSelectedIssuer={setSelectedIssuer}
        selectedMarketTag={selectedMarketTag}
        setSelectedMarketTag={setSelectedMarketTag}
        recencyDays={recencyDays}
        setRecencyDays={setRecencyDays}
        featuredOnly={featuredOnly}
        setFeaturedOnly={setFeaturedOnly}
        issuerOptions={issuerOptions}
        marketTagOptions={marketTagOptions}
      />
      <p className="mb-3 text-sm text-slate-600">Sorted by newest · {filtered.length} stories</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{shown.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
      {shown.length < filtered.length && (
        <button className="mt-4 rounded bg-navy px-4 py-2 text-white" onClick={() => setPage((p) => p + 1)}>Load more</button>
      )}
    </div>
  );
}
