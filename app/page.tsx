import { promises as fs } from "fs";
import path from "path";
import NewsDashboard from "../components/news-dashboard";
import { readArticles } from "../lib/news-store";

export const dynamic = "force-dynamic";

async function getLastUpdatedTimestamp(): Promise<string | null> {
  try {
    const dataPath = path.join(process.cwd(), "data", "articles.json");
    const stat = await fs.stat(dataPath);
    return stat.mtime.toISOString();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [articles, lastUpdatedAt] = await Promise.all([readArticles(), getLastUpdatedTimestamp()]);

  return <NewsDashboard articles={articles} lastUpdatedAt={lastUpdatedAt} />;
}
