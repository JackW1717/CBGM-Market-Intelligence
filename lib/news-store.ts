import { promises as fs } from "fs";
import path from "path";
import type { NewsItem } from "../types/news";

const DATA_PATH = path.join(process.cwd(), "data", "articles.json");

export async function readArticles(): Promise<NewsItem[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as NewsItem[];
  } catch {
    return [];
  }
}

export async function writeArticles(articles: NewsItem[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(articles, null, 2), "utf8");
}
