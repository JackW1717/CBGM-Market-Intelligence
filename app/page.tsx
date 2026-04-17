import NewsDashboard from "../components/news-dashboard";
import { readArticles } from "../lib/news-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await readArticles();
  return <NewsDashboard articles={articles} />;
}
