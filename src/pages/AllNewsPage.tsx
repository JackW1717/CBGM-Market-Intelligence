import { useMemo, useState } from 'react';
import { ArticleCard } from '../components/ArticleCard';
import { FilterBar } from '../components/FilterBar';
import { articles } from '../lib/data';

const PAGE_SIZE = 9;

export function AllNewsPage() {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedIssuer, setSelectedIssuer] = useState('');
  const [selectedMarketTag, setSelectedMarketTag] = useState('');
  const [recencyDays, setRecencyDays] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const issuerOptions = useMemo(() => [...new Set(articles.flatMap((a) => a.issuer_type))].sort(), []);
  const marketTagOptions = useMemo(() => [...new Set(articles.flatMap((a) => a.market_tags))].sort(), []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((previous) =>
      previous.includes(category) ? previous.filter((item) => item !== category) : [...previous, category],
    );
    setPage(1);
  };

  const filtered = useMemo(() => {
    const now = Date.now();

    return articles.filter((article) => {
      if (
        selectedCategories.length > 0
        && !selectedCategories.some((category) => article.category.includes(category))
      ) {
        return false;
      }

      if (selectedRegion && !article.region.includes(selectedRegion)) return false;
      if (selectedIssuer && !article.issuer_type.includes(selectedIssuer)) return false;
      if (selectedMarketTag && !article.market_tags.includes(selectedMarketTag)) return false;
      if (featuredOnly && !article.featured) return false;

      if (recencyDays) {
        const ageDays = (now - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24);
        if (ageDays > Number(recencyDays)) return false;
      }

      const blob = `${article.title} ${article.summary} ${article.market_tags.join(' ')} ${article.issuer_type.join(' ')}`
        .toLowerCase();

      return blob.includes(query.toLowerCase());
    });
  }, [query, selectedCategories, selectedRegion, selectedIssuer, selectedMarketTag, featuredOnly, recencyDays]);

  const shown = filtered.slice(0, page * PAGE_SIZE);

  return (
    <div>
      <h1 className="mb-3 text-2xl font-bold text-navy">All News</h1>
      <FilterBar
        query={query}
        setQuery={setQuery}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
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

      {filtered.length === 0 && (
        <div className="mb-3 rounded border border-slate-200 bg-white p-4 text-sm text-slate-700">
          No real articles yet. Run Actions → Daily news update to ingest live feed items.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {shown.length < filtered.length && (
        <button className="mt-4 rounded bg-navy px-4 py-2 text-white" onClick={() => setPage((value) => value + 1)}>
          Load more
        </button>
      )}
    </div>
  );
}
