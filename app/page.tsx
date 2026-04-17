import NewsDashboard from "../components/news-dashboard";
import { collectNewsItems } from "../lib/fetch-news";
import { readArticles } from "../lib/news-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const cachedArticles = await readArticles();
  const articles = cachedArticles.length > 0 ? cachedArticles : await collectNewsItems();

  return <NewsDashboard articles={articles} />;
}
