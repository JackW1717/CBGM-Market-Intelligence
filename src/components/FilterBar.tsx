import { categories, regions } from '../lib/constants';

interface FilterProps {
  query: string;
  setQuery: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedRegion: string;
  setSelectedRegion: (v: string) => void;
  selectedIssuer: string;
  setSelectedIssuer: (v: string) => void;
  selectedMarketTag: string;
  setSelectedMarketTag: (v: string) => void;
  recencyDays: string;
  setRecencyDays: (v: string) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (v: boolean) => void;
  issuerOptions: string[];
  marketTagOptions: string[];
}

export function FilterBar(props: FilterProps) {
  return (
    <section className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:grid-cols-4">
      <input className="rounded border border-slate-300 px-3 py-2" placeholder="Search keywords" value={props.query} onChange={(e) => props.setQuery(e.target.value)} />
      <select className="rounded border border-slate-300 px-3 py-2" value={props.selectedCategory} onChange={(e) => props.setSelectedCategory(e.target.value)}>
        <option value="">All themes</option>
        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <select className="rounded border border-slate-300 px-3 py-2" value={props.selectedRegion} onChange={(e) => props.setSelectedRegion(e.target.value)}>
        <option value="">All regions</option>
        {regions.map((region) => <option key={region} value={region}>{region}</option>)}
      </select>
      <select className="rounded border border-slate-300 px-3 py-2" value={props.selectedIssuer} onChange={(e) => props.setSelectedIssuer(e.target.value)}>
        <option value="">All issuer types</option>
        {props.issuerOptions.map((issuer) => <option key={issuer} value={issuer}>{issuer}</option>)}
      </select>
      <select className="rounded border border-slate-300 px-3 py-2" value={props.selectedMarketTag} onChange={(e) => props.setSelectedMarketTag(e.target.value)}>
        <option value="">All market types</option>
        {props.marketTagOptions.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
      </select>
      <select className="rounded border border-slate-300 px-3 py-2" value={props.recencyDays} onChange={(e) => props.setRecencyDays(e.target.value)}>
        <option value="">Any recency</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
      <label className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
        <input type="checkbox" checked={props.featuredOnly} onChange={(e) => props.setFeaturedOnly(e.target.checked)} />
        Featured only
      </label>
      <div className="rounded border border-slate-200 bg-fog px-3 py-2 text-xs text-slate-600">
        Demo and live feed stories coexist. Demo items are labeled with [DEMO].
      </div>
    </section>
  );
}
