import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getAllPosts } from "@/lib/blog";

/**
 * Static pages → fixed lastModified (site launch / last meaningful update).
 * `new Date()` on every build is an SEO anti-pattern — it tells Google every
 * page was "updated just now", which dilutes the freshness signal.
 */
const SITE_LAUNCH = new Date("2026-04-01");

/** Pages whose content changes infrequently. */
const staticPages: { path: string; priority: number }[] = [
  { path: "", priority: 1.0 },       // landing
  { path: "/pricing", priority: 0.9 },
  { path: "/blog", priority: 0.85 },
  { path: "/about", priority: 0.7 },
  { path: "/faq", priority: 0.7 },
  { path: "/affiliate", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
  { path: "/contact", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().toString().replace(/\/$/, "");

  const posts = getAllPosts();

  return [
    ...staticPages.map(({ path, priority }) => ({
      url: `${base}${path || "/"}`,
      lastModified: SITE_LAUNCH,
      changeFrequency: (path === "/blog" ? "weekly" : "monthly") as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
