import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content/blog");

export type BlogCategory =
  | "Chinese Zodiac"
  | "Five Elements"
  | "Astrology vs Western"
  | "Relationship astrology";

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  category: BlogCategory;
};

export type PostMeta = PostFrontmatter & { slug: string };

function parseFrontmatter(data: Record<string, unknown>, slug: string): PostMeta {
  const title = String(data.title ?? "");
  const description = String(data.description ?? "");
  const date = String(data.date ?? "");
  const category = data.category as PostFrontmatter["category"];
  return { slug, title, description, date, category };
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): {
  meta: PostMeta;
  content: string;
} | null {
  const full = path.join(postsDir, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  return {
    meta: parseFrontmatter(data as Record<string, unknown>, slug),
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => getPostBySlug(slug)!)
    .map((p) => p.meta)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Chinese Zodiac",
  "Five Elements",
  "Astrology vs Western",
  "Relationship astrology",
];
