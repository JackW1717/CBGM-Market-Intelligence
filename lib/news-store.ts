import { promises as fs } from "fs";
import path from "path";
import type { NewsItem } from "../types/news";

const DATA_PATH = path.join(process.cwd(), "data", "articles.json");
const HEALTH_PATH = path.join(process.cwd(), "data", "source-health.json");

export interface SourceHealthEntry {
  consecutiveFailures: number;
  lastStatus: "success" | "failure" | "skipped";
  lastMessage: string;
  updatedAt: string;
}

export type SourceHealth = Record<string, SourceHealthEntry>;

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

export async function readSourceHealth(): Promise<SourceHealth> {
  try {
    const raw = await fs.readFile(HEALTH_PATH, "utf8");
    return JSON.parse(raw) as SourceHealth;
  } catch {
    return {};
  }
}

export async function writeSourceHealth(health: SourceHealth): Promise<void> {
  await fs.mkdir(path.dirname(HEALTH_PATH), { recursive: true });
  await fs.writeFile(HEALTH_PATH, JSON.stringify(health, null, 2), "utf8");
}
