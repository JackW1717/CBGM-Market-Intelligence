import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';

interface FeedSource { name: string; url: string; type: string; rss: boolean }
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

const ruleMap: Array<{ kw: string; cat: string; reason: string; score: number }> = [
  { kw: 'bond', cat: 'Global Bonds', reason: 'Bond issuance and debt market flow directly impact CBGM origination priorities.', score: 14 },
  { kw: 'sovereign', cat: 'Sovereign Debt', reason: 'Sovereign or quasi-sovereign financing shapes benchmark pricing and distribution.', score: 13 },
  { kw: 'municipal', cat: 'Municipal Bonds', reason: 'Municipal debt developments are core to public-sector financing access.', score: 12 },
  { kw: 'project finance', cat: 'Project Finance', reason: 'Infrastructure and project finance pipelines are strategic deal opportunities.', score: 12 },
  { kw: 'token', cat: 'Digital Assets / Tokenization', reason: 'Debt tokenization and regulated rails are high-priority innovation signals.', score: 12 },
  { kw: 'fintech', cat: 'Fintech', reason: 'Fintech infrastructure can improve market access and issuance workflows.', score: 10 },
  { kw: 'regulation', cat: 'Regulation', reason: 'Regulatory updates influence issuance structure, compliance, and market timing.', score: 9 },
  { kw: 'startup', cat: 'Early-Stage Funding', reason: 'Early-stage capital activity indicates pipeline and ecosystem momentum.', score: 8 },
];

const sanitize = (value: string) =>
  value.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const extractTag = (xml: string, tag: string) => sanitize(xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] ?? '');

const toIsoDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const parseItems = (xml: string) => {
  const itemMatches = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((m) => m[0]);
  const entryMatches = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((m) => m[0]);
  const chunks = itemMatches.length > 0 ? itemMatches : entryMatches;
  return chunks.map((chunk) => {
    const title = extractTag(chunk, 'title');
    const link = extractTag(chunk, 'link') || chunk.match(/<link[^>]*href="([^"]+)"/i)?.[1] || '';
    const pubDate = extractTag(chunk, 'pubDate') || extractTag(chunk, 'updated') || new Date().toISOString();
    const summary = extractTag(chunk, 'description') || extractTag(chunk, 'summary') || extractTag(chunk, 'content');
    return { title, link, pubDate, summary };
  });
};

function classify(text: string) {
  const lowered = text.toLowerCase();
  const hits = ruleMap.filter((rule) => lowered.includes(rule.kw));
  const category = [...new Set(hits.map((h) => h.cat))];
  const score = Math.min(99, 35 + hits.reduce((acc, hit) => acc + hit.score, 0));
  return {
    category: category.length ? category : ['Market Infrastructure'],
    relevance_score: score,
    cbgm_relevance_reason: hits[0]?.reason ?? 'Market infrastructure development may influence CBGM execution quality.',
  };
}

async function main() {
  const sources = JSON.parse(await fs.readFile(sourcesPath, 'utf8')) as FeedSource[];
  const existing = JSON.parse(await fs.readFile(articlesPath, 'utf8')) as Article[];
  const dedupe = new Set(existing.map((a) => a.article_url));
  const now = new Date().toISOString();
  const created: Article[] = [];

  for (const source of sources.filter((s) => s.rss)) {
    try {
      const res = await fetch(source.url, { headers: { 'User-Agent': 'CBGM-Market-Intelligence-Hub/1.0' } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const xml = await res.text();
      const items = parseItems(xml).slice(0, 15);
      for (const item of items) {
        if (!item.link || dedupe.has(item.link)) continue;
        const hash = crypto.createHash('sha256').update(`${item.title}-${item.pubDate}`).digest('hex').slice(0, 12);
        if (existing.some((a) => a.id === hash || a.title === item.title)) continue;
        const textBlob = `${item.title} ${item.summary}`;
        const cls = classify(textBlob);
        created.push({
          id: `feed-${hash}`,
          title: item.title,
          source_name: source.name,
          source_url: source.url,
          article_url: item.link,
          published_at: toIsoDate(item.pubDate),
          summary: sanitize(item.summary).slice(0, 280),
          full_excerpt_optional: null,
          category: cls.category,
          region: ['Global'],
          issuer_type: ['Corporate'],
          market_tags: ['primary markets', 'market transparency'],
          featured: false,
          relevance_score: cls.relevance_score,
          cbgm_relevance_reason: cls.cbgm_relevance_reason,
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
    console.log('No new items found.');
    return;
  }

  const merged = [...created, ...existing].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );

  await fs.writeFile(articlesPath, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Added ${created.length} new items.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
