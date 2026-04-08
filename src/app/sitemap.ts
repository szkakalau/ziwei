import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().toString().replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/pricing",
    "/blog",
    "/about",
    "/faq",
    "/affiliate",
    "/privacy",
    "/terms",
    "/contact",
  ];

  const posts = getAllPosts();

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path || "/"}`,
      lastModified: new Date(),
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.date),
    })),
  ];
}
