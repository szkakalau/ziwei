import { getAllPosts } from "@/lib/blog";
import { BRAND_NAME, DEFAULT_META_DESCRIPTION } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";

/**
 * GET /rss.xml
 *
 * RSS 2.0 feed for blog posts. Provides a machine-readable feed for RSS readers
 * and AI crawlers (ChatGPT, Perplexity, etc.) that use RSS for content discovery.
 *
 * Uses Node.js runtime (not edge) because getAllPosts() reads .mdx files
 * from the filesystem via gray-matter.
 */
export function GET() {
  const site = getSiteUrl();
  const base = site.toString().replace(/\/$/, "");
  const posts = getAllPosts();

  const items = posts
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .map((post) => {
      const url = `${base}/blog/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(BRAND_NAME)} Blog</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(DEFAULT_META_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
