import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const checks = [
  { file: 'data/articles.json', expect: 'array' },
  { file: 'data/sources.json', expect: 'array' },
  { file: 'data/market-snapshot.json', expect: 'object' },
  { file: 'data/fetch-status.json', expect: 'object', optional: true },
];

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

async function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  const text = await fs.readFile(fullPath, 'utf8');
  return JSON.parse(text);
}

async function main() {
  for (const check of checks) {
    try {
      const data = await readJson(check.file);
      if (check.expect === 'array' && !Array.isArray(data)) {
        throw new Error(`Expected JSON array in ${check.file}.`);
      }
      if (check.expect === 'object' && !isObject(data)) {
        throw new Error(`Expected JSON object in ${check.file}.`);
      }
      console.log(`OK ${check.file}`);
    } catch (error) {
      if (check.optional && error instanceof Error && /ENOENT/.test(error.message)) {
        console.log(`SKIP ${check.file} (optional and not found)`);
        continue;
      }
      throw error;
    }
  }
}

main().catch((error) => {
  console.error(`Data validation failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
