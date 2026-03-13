import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

interface FeedSource {
  name: string;
  url: string;
  type: string;
  rss: boolean;
}

interface Article {
  id: string;
  title: string;
  source_name: string;
  source_url: string;
  article_url: string;
  published_at: string;
  summary: string;
  full_excerpt_optional: string | null;
  category: string[];
  region: string[];
  issuer_type: string[];
  market_tags: string[];
  featured: boolean;
  relevance_score: number;
  cbgm_relevance_reason: string;
  image_url_optional: string | null;
  source_type_optional: string | null;
  fetched_at_optional: string | null;
}

const root = path.resolve(process.cwd());
const sourcesPath = path.join(root, 'data/sources.json');
const articlesPath = path.join(root, 'data/articles.json');

const keywordRules: Array<{ pattern: RegExp; category: string; marketTag: string; issuer: string; score: number; reason: string }> = [
  { pattern: /\bbond|note issuance|debt issuance|syndicated debt|fixed income|credit markets?\b/i, category: 'Global Bonds', marketTag: 'bond issuance', issuer: 'Corporate', score: 14, reason: 'Bond issuance activity is core to CBGM market intelligence priorities.' },
  { pattern: /\bsovereign|treasury|government debt|quasi-sovereign|dm[o]?\b/i, category: 'Sovereign Debt', marketTag: 'sovereign finance', issuer: 'Sovereign', score: 13, reason: 'Sovereign finance signals benchmark pricing and market access conditions.' },
  { pattern: /\bmunicipal|muni\b/i, category: 'Municipal Bonds', marketTag: 'municipal finance', issuer: 'Municipal', score: 12, reason: 'Municipal markets are directly relevant to public-sector debt access.' },
  { pattern: /\bproject finance|infrastructure finance|ppp|blended finance|infrastructure debt\b/i, category: 'Project Finance', marketTag: 'project finance', issuer: 'Project', score: 13, reason: 'Project and infrastructure finance opportunities are strategically important to CBGM.' },
  { pattern: /\btokeni[sz]ed?|digital bond|on-chain|dlt\b/i, category: 'Digital Assets / Tokenization', marketTag: 'tokenized debt', issuer: 'Corporate', score: 12, reason: 'Digital issuance and tokenized debt rails align with CBGM innovation goals.' },
  { pattern: /\bfintech|payments? rails?|embedded finance|regtech|neobank|open banking|post-trade|clearing\b/i, category: 'Fintech', marketTag: 'issuance infrastructure', issuer: 'Corporate', score: 12, reason: 'Fintech and market infrastructure developments can improve issuance and distribution capabilities.' },
  { pattern: /\bmarket infrastructure|trading venue|exchange infrastructure|settlement system\b/i, category: 'Market Infrastructure', marketTag: 'market structure', issuer: 'Corporate', score: 10, reason: 'Market infrastructure changes can impact execution quality and distribution.' },
  { pattern: /\bregulat|sec\b|fca\b|policy|compliance|rulemaking\b/i, category: 'Regulation', marketTag: 'market transparency', issuer: 'Corporate', score: 9, reason: 'Regulatory change influences issuance pathways, transparency, and deal execution.' },
  { pattern: /\bstartup|series\s+[a-f]|pre-seed|seed round|venture capital|vc funding|fundraising\b/i, category: 'Early-Stage Funding', marketTag: 'capital formation', issuer: 'Startup', score: 12, reason: 'Early-stage funding stories indicate capital formation and pipeline momentum.' },
  { pattern: /\bemerging markets?|frontier markets?|developing economies?|cross-border financing\b/i, category: 'Emerging Markets', marketTag: 'cross-border financing', issuer: 'Multilateral', score: 12, reason: 'Emerging market capital access and cross-border financing are core CBGM themes.' },
  { pattern: /\bgreen bond|transition finance|sustainable finance|climate finance\b/i, category: 'Project Finance', marketTag: 'sustainable debt', issuer: 'Project', score: 10, reason: 'Sustainable debt and climate finance are key growth pockets in project and infrastructure funding.' },
];

const sourceRegionHints: Array<{ pattern: RegExp; region: string }> = [
  { pattern: /\buk|london|fca/i, region: 'United Kingdom' },
  { pattern: /\beu|europe|ec\.europa|ebrd/i, region: 'Europe' },
  { pattern: /\bsec\b|sifma|united states|reuters|ifc|techcrunch/i, region: 'United States' },
  { pattern: /\bmas\b|asia|singapore/i, region: 'Asia' },
  { pattern: /\bafrica|afdb/i, region: 'Africa' },
  { pattern: /\blatin america|iadb/i, region: 'Latin America' },
  { pattern: /\bmiddle east|gcc|mena/i, region: 'Middle East' },
  { pattern: /\bworld bank|bis/i, region: 'Global' },
];

const sanitize = (value: string): string =>
  value.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const extractTag = (xml: string, tag: string): string =>
  sanitize(xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] ?? '');

const toIsoDate = (value: string): string => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const parseItems = (xml: string) => {
  const itemMatches = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  const entryMatches = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  const chunks = itemMatches.length > 0 ? itemMatches : entryMatches;

  return chunks.map((chunk) => {
    const title = extractTag(chunk, 'title');
    const link = extractTag(chunk, 'link') || chunk.match(/<link[^>]*href="([^"]+)"/i)?.[1] || '';
    const pubDate = extractTag(chunk, 'pubDate') || extractTag(chunk, 'published') || extractTag(chunk, 'updated') || new Date().toISOString();
    const summary = extractTag(chunk, 'description') || extractTag(chunk, 'summary') || extractTag(chunk, 'content');
    return { title, link, pubDate, summary };
  });
};

const inferRegion = (source: FeedSource, textBlob: string): string[] => {
  const sourceBlob = `${source.name} ${source.url} ${textBlob}`;
  for (const hint of sourceRegionHints) {
    if (hint.pattern.test(sourceBlob)) {
      return [hint.region, 'Global'];
    }
  }
  return ['Global'];
};

const classify = (textBlob: string) => {
  const hits = keywordRules.filter((rule) => rule.pattern.test(textBlob));

  const categories = [...new Set(hits.map((hit) => hit.category))];
  const marketTags = [...new Set(hits.map((hit) => hit.marketTag))];
  const issuerTypes = [...new Set(hits.map((hit) => hit.issuer))];
  const score = Math.min(99, 35 + hits.reduce((acc, hit) => acc + hit.score, 0));

  return {
    categories: categories.length > 0 ? categories : ['Market Infrastructure'],
    marketTags: marketTags.length > 0 ? marketTags : ['market transparency'],
    issuerTypes: issuerTypes.length > 0 ? issuerTypes : ['Corporate'],
    relevanceScore: score,
    reason: hits[0]?.reason ?? 'Market infrastructure and transparency developments remain relevant to CBGM execution strategy.',
  };
};

async function main() {
  const sources = JSON.parse(await fs.readFile(sourcesPath, 'utf8')) as FeedSource[];
  const existingRaw = JSON.parse(await fs.readFile(articlesPath, 'utf8')) as Article[];
  const existing = existingRaw.filter((article) => !article.title.startsWith('[DEMO]') && !article.article_url.includes('example.com/demo-article'));

  const dedupe = new Set(existing.map((article) => article.article_url));
  const now = new Date().toISOString();
  const created: Article[] = [];

  for (const source of sources.filter((candidate) => candidate.rss)) {
    try {
      const response = await fetch(source.url, { headers: { 'User-Agent': 'CBGM-Market-Intelligence-Hub/1.0 (+github-actions)' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

      const xml = await response.text();
      const items = parseItems(xml).slice(0, 20);

      for (const item of items) {
        if (!item.title || !item.link || dedupe.has(item.link)) continue;

        const hash = crypto.createHash('sha256').update(`${item.link}-${item.pubDate}`).digest('hex').slice(0, 14);
        const textBlob = `${item.title} ${item.summary}`;
        const cls = classify(textBlob);

        created.push({
          id: `feed-${hash}`,
          title: sanitize(item.title),
          source_name: source.name,
          source_url: source.url,
          article_url: item.link,
          published_at: toIsoDate(item.pubDate),
          summary: sanitize(item.summary).slice(0, 320) || 'No summary provided by source feed.',
          full_excerpt_optional: null,
          category: cls.categories,
          region: inferRegion(source, textBlob),
          issuer_type: cls.issuerTypes,
          market_tags: cls.marketTags,
          featured: cls.relevanceScore >= 75,
          relevance_score: cls.relevanceScore,
          cbgm_relevance_reason: cls.reason,
          image_url_optional: null,
          source_type_optional: source.type,
          fetched_at_optional: now,
        });

        dedupe.add(item.link);
      }

      console.log(`Source OK: ${source.name} (${items.length} scanned)`);
    } catch (error) {
      console.warn(`Source skipped: ${source.name} -> ${(error as Error).message}`);
    }
  }

  if (created.length === 0) {
    console.log('No new items found. Existing non-demo dataset retained.');
    await fs.writeFile(articlesPath, JSON.stringify(existing, null, 2) + '\n');
    return;
  }

  const merged = [...created, ...existing]
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 300);

  await fs.writeFile(articlesPath, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Added ${created.length} new real articles. Total stored: ${merged.length}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
