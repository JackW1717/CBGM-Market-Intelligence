import { collectNewsItems } from "../lib/fetch-news";
import {
  readArticles,
  readSourceHealth,
  writeArticles,
  writeSourceHealth,
  type SourceHealth
} from "../lib/news-store";

function updateHealth(previous: SourceHealth, results: Awaited<ReturnType<typeof collectNewsItems>>["sourceResults"]): SourceHealth {
  const next: SourceHealth = { ...previous };
  const now = new Date().toISOString();

  for (const result of results) {
    const prevFailures = previous[result.name]?.consecutiveFailures ?? 0;
    const consecutiveFailures = result.status === "failure" ? prevFailures + 1 : 0;

    next[result.name] = {
      consecutiveFailures,
      lastStatus: result.status,
      lastMessage: result.message,
      updatedAt: now
    };
  }

  return next;
}

async function main() {
  const previousData = await readArticles();
  const sourceHealth = await readSourceHealth();

  const run = await collectNewsItems(sourceHealth);
  const nextHealth = updateHealth(sourceHealth, run.sourceResults);
  await writeSourceHealth(nextHealth);

  if (run.items.length === 0) {
    console.warn("[WARN] Refresh produced zero valid items. Preserving last successful dataset.");
    console.warn(`[WARN] Existing dataset count remains: ${previousData.length}`);
    return;
  }

  await writeArticles(run.items);

  const successCount = run.sourceResults.filter((x) => x.status === "success").length;
  const failureCount = run.sourceResults.filter((x) => x.status === "failure").length;
  const skippedCount = run.sourceResults.filter((x) => x.status === "skipped").length;

  console.log(`Saved ${run.items.length} items to data/articles.json`);
  console.log(`Sources => success: ${successCount}, failure: ${failureCount}, skipped: ${skippedCount}`);
}

main().catch((error) => {
  console.error("refresh-news failed", error);
  process.exit(1);
});
