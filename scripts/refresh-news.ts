import { collectNewsItems } from "../lib/fetch-news";
import { writeArticles } from "../lib/news-store";

async function main() {
  const merged = await collectNewsItems();
  await writeArticles(merged);
  console.log(`Saved ${merged.length} items to data/articles.json`);
}

main().catch((error) => {
  console.error("refresh-news failed", error);
  process.exit(1);
});
